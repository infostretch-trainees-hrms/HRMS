$(function() {
    $.fn.loadCalendar = function(){
    preloader_enter();
    $.ajax(
        {
            url:'/trainingCalendar',
            success:function(data){
                var Events1=JSON.stringify(data);
               var cal = $( '#calendar' ).calendario( {
                        onDayClick : function( $el, $contentEl, dateProperties ) {

                            for( var key in dateProperties ) {
                               /* console.log( key + ' = ' + dateProperties[ key ] );*/
                            }

                        },
                        caldata : Events1
                    } ),
                    $month = $( '#custom-month' ).html( cal.getMonthName() ),
                    $year = $( '#custom-year' ).html( cal.getYear() );

                $( '#custom-next' ).on( 'click', function() {
                    cal.gotoNextMonth( updateMonthYear );
                } );
                $( '#custom-prev' ).on( 'click', function() {
                    cal.gotoPreviousMonth( updateMonthYear );
                } );
                $( '#custom-current' ).on( 'click', function() {
                    cal.gotoNow( updateMonthYear );
                } );

                function updateMonthYear() {
                    $month.html( cal.getMonthName() );
                    $year.html( cal.getYear() );
                }

            },
            error:function(data){
                alert('error!');
            }
        });
preloader_exit();
    };
    $(this).loadCalendar();
});
