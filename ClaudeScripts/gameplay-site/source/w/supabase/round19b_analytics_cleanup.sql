do $$
begin
  perform set_config('statement_timeout', '0', true);
  delete from public.analytics_events a using public.analytics_events b
    where a.session_id = b.session_id and a.event = b.event and a.client_at = b.client_at and a.props = b.props and a.id > b.id;
  update public.analytics_events e set props = e.props - array['lh', 'wd', 'asn', 'city', 'isp']
    where e.event = 'env_geo' and e.props ?| array['lh', 'wd', 'asn', 'city', 'isp'];
  update public.analytics_events e set props = e.props - array['sw', 'sh', 'aw', 'ah']
    where e.event = 'env_scr' and e.props ?| array['sw', 'sh', 'aw', 'ah'];
  update public.analytics_events e set props = (e.props - 'adb') || case when jsonb_typeof(e.props -> 'langs') = 'array' and jsonb_array_length(e.props -> 'langs') > 1 then jsonb_build_object('langs', jsonb_build_array(e.props -> 'langs' -> 0)) else '{}'::jsonb end
    where e.event = 'env_dev' and (e.props ? 'adb' or (jsonb_typeof(e.props -> 'langs') = 'array' and jsonb_array_length(e.props -> 'langs') > 1));
  update public.analytics_events e set props = e.props - array['mdist', 'wheel', 'scr', 'copy', 'rsz']
    where e.event = 'sess_sum' and e.props ?| array['mdist', 'wheel', 'scr', 'copy', 'rsz'];
  update public.analytics_events e set props = e.props - array['ck', 'dnt', 'gpc', 'pdf', 'sab', 'coi', 'swk', 'notif', 'vib', 'bt', 'usb', 'ser', 'hid', 'xr', 'midi', 'share', 'wl', 'voices', 'mic', 'cam', 'spk', 'sr', 'ach',
      'h264', 'vp9', 'av1', 'hevc', 'mtex', 'glx', 'gpuv', 'quota', 'used', 'qb', 'pers', 'heap', 'bat', 'batb', 'chg', 'bench', 'benchb', 'loc', 'cal', 'num', 'hc', 'fdw', 'hist', 'plat', 'vend', 'ua']
    where e.event = 'env_caps' and e.props ?| array['ua', 'bat', 'mic', 'cam', 'bench', 'quota', 'dnt', 'gpc', 'plat', 'vend', 'hist', 'loc', 'voices', 'heap', 'ck'];
end;
$$;

update private.housekeep set retention = true where id = 1;
