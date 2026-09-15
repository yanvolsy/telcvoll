(function(){
  function setManifest(){
    var dark=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var link=document.getElementById('app-manifest')||document.querySelector('link[rel="manifest"]');
    if(link) link.href=dark?'/manifest-dark.webmanifest':'/manifest-light.webmanifest';
  }
  setManifest();
  if(window.matchMedia){
    var mq=window.matchMedia('(prefers-color-scheme: dark)');
    if(mq.addEventListener) mq.addEventListener('change',setManifest); else if(mq.addListener) mq.addListener(setManifest);
  }
})();
