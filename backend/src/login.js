import 'es6-promise/auto';
import * as config from './config/config';

function getmetaContent() {
  const metas = document.getElementsByTagName('meta');
  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute('name') === 'githubclientid') {
      return metas[i].getAttribute('content');
    }
  }
  return '';
}
window.swal.setDefaults({ allowOutsideClick: false });
$(() => {
  const githubclientid = getmetaContent();
  $('.submit').on('click', (e) => {
    e.preventDefault();
    swal({
      title: '',
      text: '登入中',
      type: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
    });
    const sw = screen.width;
    const sh = screen.height;
    window.open(`https://github.com/login/oauth/authorize?client_id=${githubclientid}&scope=user:email repo`,
    '_blank',
    `toolbar=no,location=no,menubar=no,status=no,width=${sw / 2},height=${sh / 2},left=${sw / 4},top=${sh / 4}`);
  });
});

window.setCode = (code) => {
  $.ajax({
    url: `${config.AjaxUrl}/api/accesstoken`,
    data: { code },
    dataType: 'json',
    method: 'POST',
  }).done((d) => {
    if (d.status === 'OK') {
      Cookies.set('t', d.data.token);
      // Cookies.set('i', d.data._id);
      window.location.href = '/';
    } else {
      swal('Oops..', d.err.message, 'error');
    }
  });
};
