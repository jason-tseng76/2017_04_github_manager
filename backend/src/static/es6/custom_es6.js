/**
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Sidebar
$(document).ready(() => {
  const setContentHeight = () => {
    if ($('.container.body').outerHeight() < $('.right_col').outerHeight()) {
      $('.container.body').outerHeight($('.right_col').outerHeight());
    }

    if ($('.login_form').height()) {
      $('.login_wrapper').css({ 'margin-top': 0 });
      $('.login_form').css('top', ($(window).height() - $('.login_form').height()) / 2);
    }
  };
  window.setContentHeight = setContentHeight;


  // toggle small or large menu
  $('.menu_toggle').on('click', () => {
    $('.container.body').toggleClass('menutoggle-md menutoggle-sm');

    setContentHeight();
  });

  // recompute content when resizing
  $(window).smartresize(() => {
    setContentHeight();
  });

  setContentHeight();

  // fixed sidebar
  if ($.fn.mCustomScrollbar) {
    $('.menu_fixed').mCustomScrollbar({
      autoHideScrollbar: true,
      theme: 'minimal',
      mouseWheel: { preventDefault: true },
    });
  }

  $('.close-link').click(function () {
    const $BOX_PANEL = $(this).closest('.x_panel');

    $BOX_PANEL.remove();
  });

  // Accordion
  $('.expand').on('click', function () {
    $(this).next().slideToggle(200);
    const $expand = $(this).find('>:first-child');

    if ($expand.text() === '+') {
      $expand.text('-');
    } else {
      $expand.text('+');
    }
  });
});

window.closeMenu = () => {
  if ($('.topnav_title').css('display') === 'none') {
    if ($('.container.body').hasClass('menutoggle-sm')) {
      $('.container.body').toggleClass('menutoggle-md menutoggle-sm');
    }
  }
};

function initUtils() {
  // check active menu
  const CURRENT_URL = window.location.href.split('?')[0];
  const $SIDEBAR_MENU = $('#sidebar-menu');
  $SIDEBAR_MENU.find('a').filter(function () {
    // if ($(this).attr('url')) return (CURRENT_URL.indexOf($(this).attr('url')) >= 0);
    return this.href === CURRENT_URL;
  }).parent('li')
    .addClass('current-page')
    .parents('ul')
    .slideDown(() => {
      window.setContentHeight();
    })
    .parent()
    .addClass('active');

  // Panel toolbox
  $('.collapse-link').off('click');
  $('.collapse-link').on('click', function () {
    const $BOX_PANEL = $(this).closest('.x_panel');
    const $ICON = $(this).find('i');
    const $BOX_CONTENT = $BOX_PANEL.find('.x_content');

    // fix for some div with hardcoded fix class
    if ($BOX_PANEL.attr('style')) {
      $BOX_CONTENT.slideToggle(200, () => {
        $BOX_PANEL.removeAttr('style');
      });
    } else {
      $BOX_CONTENT.slideToggle(200);
      $BOX_PANEL.css('height', 'auto');
    }

    $ICON.toggleClass('fa-chevron-up fa-chevron-down');
  });

  $SIDEBAR_MENU.find('a').off('click');
  $SIDEBAR_MENU.find('a').on('click', function () {
    const $li = $(this).parent();

    if ($li.is('.active')) {
      $li.removeClass('active active-sm');
      $('ul:first', $li).slideUp(() => {
        window.setContentHeight();
      });
    } else {
      // prevent closing menu if we are on child menu
      if (!$li.parent().is('.child_menu')) {
        // $SIDEBAR_MENU.find('li').removeClass('active active-sm');
        $('#sidebar-menu>.menu_section>.side-menu>li').removeClass('active active-sm');
        $SIDEBAR_MENU.find('li ul').slideUp();
      }
      $li.addClass('active');

      $('ul:first', $li).slideDown(() => {
        window.setContentHeight();
      });
    }
  });

  // Tooltip
  $('[data-toggle="tooltip"]').tooltip({
    container: 'body',
  });
}
window.initUtils = initUtils;

/**
 * Resize function without multiple trigger
 *
 * Usage:
 * $(window).smartresize(function(){
 *     // code here
 * });
 */
(function ($, sr) {
    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  const debounce = (func, threshold, execAsap) => {
    let timeout;

    return function debounced() {
      const obj = this;
      const args = arguments;
      function delayed() {
        if (!execAsap) { func.apply(obj, args); }
        timeout = null;
      }

      if (timeout) { clearTimeout(timeout); } else if (execAsap) { func.apply(obj, args); }

      timeout = setTimeout(delayed, threshold || 100);
    };
  };

    // smartresize
  jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
}(jQuery, 'smartresize'));
