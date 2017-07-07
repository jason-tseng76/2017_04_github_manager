const code = window.location.search.split('code=')[1];
window.opener.setCode(code);
window.close();
