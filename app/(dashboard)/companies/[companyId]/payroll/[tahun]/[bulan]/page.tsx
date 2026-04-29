useEffect(() => {
  async function fetchData() {
    const supabase = createClient();
    const [{ data: co }, { data: empData }, { data: eventData }, { data: runData }] = await Promise.all([
      supabase.from('companies').select('name').eq('id', companyId).single(),
      supabase.from('employees').select('*').eq('company_id', companyId).eq('aktif', true),
      supabase.from('employee_events').select('*').eq('company_id', companyId).eq('tahun', tahun).eq('bulan', bulan),
      supabase.from('payroll_runs').select('*, payroll_results(*)').eq('company_id', companyId)
        .eq('tahun', tahun).eq('bulan', bulan).maybeSingle(),
    ]);

    // Fetch Jan-Nov accumulation for December equalization
    let accumMap: Record<string, { akum_bruto: number; pph_jan_nov: number }> = {};
    if (Number(bulan) === 12 && empData) {
      const { data: prevRuns } = await supabase
        .from('payroll_runs')
        .select('id, bulan')
        .eq('company_id', companyId)
        .eq('tahun', tahun)
        .neq('bulan', 12);

      if (prevRuns && prevRuns.length > 0) {
        const prevRunIds = prevRuns.map(r => r.id);
        const { data: prevResults } = await supabase
          .from('payroll_results')
          .select('employee_id, bruto, pph')
          .in('run_id', prevRunIds);

        for (const r of prevResults ?? []) {
          if (!accumMap[r.employee_id]) accumMap[r.employee_id] = { akum_bruto: 0, pph_jan_nov: 0 };
          accumMap[r.employee_id].akum_bruto += r.bruto ?? 0;
          accumMap[r.employee_id].pph_jan_nov += r.pph ?? 0;
        }
      }
    }

    if (co) setCompany(co);
    if (empData) setEmployees(empData.map(emp => ({
      ...emp,
      _akum_bruto:   accumMap[emp.id]?.akum_bruto   ?? 0,
      _pph_jan_nov:  accumMap[emp.id]?.pph_jan_nov  ?? 0,
    })));
    if (eventData) setEvents(eventData);
    if (runData) {
      setExistingRun(runData);
      if (runData.payroll_results?.length > 0) {
        const mapped = runData.payroll_results.map((r: any) => ({
          ...r.result_json,
          employee_id: r.employee_id,
          employee_name: empData?.find(e => e.id === r.employee_id)?.nama,
          _db: r,
        }));
        setResults(mapped);
        setIsCalculated(true);
      }
    }
    setLoading(false);
  }
  fetchData();
}, [companyId, tahun, bulan]);
