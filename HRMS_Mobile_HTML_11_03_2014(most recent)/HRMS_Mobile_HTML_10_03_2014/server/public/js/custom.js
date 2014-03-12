$(document).ready(function () {
    $('.datepickerStart').on('click', function () {
        var from_$input = $('.datepickerStart').pickadate({min: new Date(), container: '#wrapper', format: 'dd-mm-yy', weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], showMonthsShort: true, disable: [1, 7]});
        from_picker = from_$input.pickadate('picker')

        var to_$input = $('.datepickerEnd').pickadate({min: new Date(), container: '#wrapper', format: 'dd-mm-yy', weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], showMonthsShort: true, disable: [1, 7]});
        to_picker = to_$input.pickadate('picker')

        from_picker.on('set', function (event) {
            if (event.select) {
                to_picker.set('min', from_picker.get('select'))
            }
        })
        to_picker.on('set', function (event) {
            if (event.select) {
                from_picker.set('max', to_picker.get('select'))
            }
        })
    });
    $('.datepickerSingle').on('click', function () {
        $('.datepickerSingle').pickadate({container: '#wrapper', format: 'dd-mm-yy', weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], showMonthsShort: true, disable: [1, 7]})
    });
    $('.datepickerStart1').on('click', function () {

        var from_$input1 = $('.datepickerStart1').pickadate({container: '#wrapper', format: 'dd-mm-yy', weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], showMonthsShort: true, disable: [1, 7]});
        from_picker1 = from_$input1.pickadate('picker')

        var to_$input1 = $('.datepickerEnd1').pickadate({container: '#wrapper', format: 'dd-mm-yy', weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], showMonthsShort: true, disable: [1, 7]});
        to_picker1 = to_$input1.pickadate('picker')

        from_picker1.on('set', function (event) {
            if (event.select) {
                to_picker1.set('min', from_picker1.get('select'))
            }
        })
        to_picker1.on('set', function (event) {
            if (event.select) {
                from_picker1.set('max', to_picker1.get('select'))
            }
        })
    });
    /*   $('.timepickerStart').on('click',function(){
     $('.timepickerStart').pickatime({container:'#wrapper',format: 'h:i A',interval:15, min:new Date(2013,3,3,9,30),max:new Date(2013,3,3,19,30) });
     });
     $('.timepickerEnd').on('click',function(){
     $('.timepickerEnd').pickatime({container:'#wrapper',format: 'h:i A',interval:15, min:new Date(2013,3,3,9,30),max:new Date(2013,3,3,19,30) });
     });*/

    $('.timepicker').on('click', function () {
        var timeStart = $('.timepickerStart').pickatime({container: '#wrapper', format: 'h:i:00 A', interval: 15, min: new Date(2013, 3, 3, 9, 30), max: new Date(2013, 3, 3, 19, 30),onOpen: function(){$('body').animate({scrollTop:0}).css('overflow','hidden');},onClose: function(){$('body').css('overflow','auto');} });
        start_picker = timeStart.pickatime('picker');
        var timeEnd = $('.timepickerEnd').pickatime({container: '#wrapper', format: 'h:i:00 A', interval: 15, min: new Date(2013, 3, 3, 9, 30), max: new Date(2013, 3, 3, 19, 30),onOpen: function(){$('body').animate({scrollTop:0}).css('overflow','hidden');},onClose: function(){$('body').css('overflow','auto');} });
        end_picker = timeEnd.pickatime('picker');

        start_picker.on('set', function (event) {
            if (event.select) {
                end_picker.set('min', start_picker.get('select'))
            }
        })
        end_picker.on('set', function (event) {
            if (event.select) {
                start_picker.set('max', end_picker.get('select'))
            }
        })
    });


    $('ul.tabs li').click(function () {
        var tab_id = $(this).attr('data-tab');

        $('ul.tabs li').removeClass('current');
        $('.tab-content').removeClass('current');

        $(this).addClass('current');
        $("#" + tab_id).addClass('current');
    })

    $('ul.inr-tabs li').click(function () {
        var tab_id = $(this).attr('data-tab');

        $('ul.inr-tabs li').removeClass('inr-current');
        $('.tab-content').removeClass('inr-current');

        $(this).addClass('inr-current');
        $("#" + tab_id).addClass('inr-current');
    })
});

var preloader_exit = function () {
    $(".status").fadeOut(); // will first fade out the loading animation
    $(".preloader").delay(350).fadeOut("slow"); // will fade out the white DIV that covers the website.
}
var preloader_enter = function (name) {
    $(".status").show();
    $(".preloader").show();
}

