// Client-side admin page gate. Real authorization remains enforced by every admin API.
(async()=>{try{await api('admin-stats');}catch(e){location.replace('/admin/login.html');}})();
