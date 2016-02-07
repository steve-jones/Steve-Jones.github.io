$(document).ready(function () {

  // jQuery to collapse the navbar on scroll
  $(window).scroll(function() {
      if ($(".navbar").offset().top > 50) {
          $(".navbar-fixed-top").addClass("top-nav-collapse");
          $(".navbar").addClass("navbar-shadow");
      } else {
          $(".navbar-fixed-top").removeClass("top-nav-collapse");
          $(".navbar").removeClass("navbar-shadow");
      }
  });

  $('a.page-scroll').bind('click', function(event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
          scrollTop: $($anchor.attr('href')).offset().top
      }, 1500, 'easeInOutExpo');
      event.preventDefault();
  });


  // Closes the Responsive Menu on Menu Item Click
  $('.navbar-collapse ul li a').click(function() {
      $('.navbar-toggle:visible').click();
  });

  $("#to-top").mouseover(function() {
      $("#to-top-copy").animate({opacity: "1"}, "slow");
  });
  $("#to-top").mouseout(function() {
      $("#to-top-copy").animate({opacity: "0"}, "slow");
  });

    //FANCY BOX PLUGIN SCRIPT FOR POPUP IMAGE
    $('.fancybox-media').fancybox({
        openEffect: 'elastic',
        closeEffect: 'elastic',
        helpers: {
            title: {
                type: 'inside'
            }
        }
    });
    //ISOTOPE  PLUGIN SCRIPT FOR FILTER FUCNTIONALITY
    $(window).load(function () {
        var $container = $('#portfolio-div');
        $container.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
        $('.categories a').click(function () {
            $('.categories .active').removeClass('active');
            $(this).addClass('active');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false
                }
            });
            return false;
        });

    });

});
