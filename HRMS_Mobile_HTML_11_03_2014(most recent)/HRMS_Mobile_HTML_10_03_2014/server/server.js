var express  = require('express');
var app      = express();
var mysql = require('mysql');
var file = require('fs');
var connection = mysql.createConnection(
    { host: 'mysql://$OPENSHIFT_MYSQL_DB_HOST:$OPENSHIFT_MYSQL_DB_PORT/',
        user: 'adminQxRxAq7',
        password: 'vtZCGvSKpN_n',
        database: 'openhrms'
    });
//ishant
connection.connect();
console.log("DB connected");
var port = process.env.PORT || 8080;
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public/'));
});
app.post('/loginCheck', function(req, res) {

    if(req.body.username =="" || req.body.password ==""){
        res.json({status:0})//username or password missing
    }
    else{
        connection.query("select user_password,user_role_id from ohrm_user where user_name='"+req.body.username+"'",function(err,result,fields) {
            if(err) { throw err;
            }
            if(result.length==0){
                res.json({status:1}); // enter correct username
            }
            else if(result[0].user_password==req.body.password)
            {
                res.json({status:3,role:result[0].user_role_id});
            }
            else
            {
                res.json({status:2});//incorrect password
            }

        });
    }
});

app.post('/home', function(req, res) {

    connection.query("select a.emp_firstname,a.emp_lastname,c.name,d.years_of_exp,a.emp_birthday,a.emp_designation,a.emp_department,e.epic_picture from hs_hr_employee a,ohrm_user b,ohrm_skill c,hs_hr_emp_skill d,hs_hr_emp_picture e where a.emp_number=b.emp_number AND c.id=d.skill_id AND a.emp_number=e.emp_number AND d.emp_number=b.emp_number AND b.user_name='"+req.body.username+"'",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/leaveApplication', function(req, res) {
    if(req.body.half_day)
    {
        var leave_length_hours=4.00;
        var leave_length_days=0.50;
    }
    else
    {
        var leave_length_hours=8.00;
        var leave_length_days=1.00;
    }
    var datearray1 = req.body.fromDate.split("-");
    var datearray2 = req.body.toDate.split("-");
    var newFromDate = datearray1[1] + '-' + datearray1[0] + '-' + datearray1[2];
    var newToDate = datearray2[1] + '-' + datearray2[0] + '-' + datearray2[2];
    var from=new Date(newFromDate);
    var trial=new Date();
    var to=new Date(newToDate);
    var newFromDate = datearray1[2] + '-' + datearray1[1] + '-' + datearray1[0];
    var newToDate = datearray2[2] + '-' + datearray2[1] + '-' + datearray2[0];
    diff=((to.getTime()-from.getTime())/(1000*24*60*60));
    var diff1=0;
    for(var i=0;i<=diff;i++){
        trial.setTime(from.getTime()+(24*3600*1000*i));
        if(!(trial.getDay()%6==0)){
            if(req.body.half_day)
            {
                diff1+=0.5;
            }
            else{
            diff1+=1;
            }
        }
    }
    connection.query("select a.no_of_days_allotted,a.leave_taken,a.leave_brought_forward from hs_hr_employee_leave_quota a,ohrm_user b,hs_hr_leavetype c,hs_hr_leave_period d where b.user_name='"+req.body.username+"' AND b.emp_number=a.employee_id AND a.leave_type_id=c.leave_type_id AND c.leave_type_name='"+req.body.leaveType+"' AND d.leave_period_id=a.leave_period_id AND '"+newFromDate+"' between d.leave_period_start_date AND leave_period_end_date",function(err,result,fields) {
        if(err) { throw err;
        }
        if((diff1)>(result[0].no_of_days_allotted-(result[0].leave_taken+result[0].leave_brought_forward))){
            res.json({leave_exceeded:true});
        }
        else{

            var flag=connection.query("select * from hs_hr_leave_requests a,ohrm_user b,hs_hr_leave c where date_applied between '"+newFromDate+"' AND '"+newToDate+"' AND a.employee_id=b.emp_number AND b.user_name='"+req.body.username+"' AND a.leave_request_id=c.leave_request_id AND c.leave_status <> '3'",function(err,result,fields) {
                if(err) { throw err;
                }

                if(result.length>0){
                    res.json({duplicate:true});
                }
                else{
                    console.log(req.body);
                    for(var i=0;i<=diff;i++){
                      trial.setTime(from.getTime()+(24*3600*1000*i));
                        if(!(trial.getDay()%6==0)){
                            connection.query("insert into hs_hr_leave_requests(leave_type_name,date_applied,leave_comments,applied_leave_date,leave_request_id,leave_type_id,leave_period_id,employee_id) select '"+req.body.leaveType+"',DATE_ADD('"+newFromDate+"',INTERVAL "+i+" DAY),'"+req.body.comments+"',CURDATE(),max(a.leave_request_id)+1,b.leave_type_id,c.leave_period_id,d.emp_number from hs_hr_leave_requests a,hs_hr_leavetype b,hs_hr_leave_period c,ohrm_user d where DATE_ADD('"+newFromDate+"',INTERVAL "+i+" DAY) between c.leave_period_start_date AND c.leave_period_end_date AND b.leave_type_name='"+req.body.leaveType+"' AND d.user_name='"+req.body.username+"'",function(err,result,fields) {
                                if(err) { throw err;
                                }

                                res.json({duplicate:false});
                            });
                            connection.query("insert into hs_hr_leave(leave_id,leave_date,leave_length_hours,leave_length_days,leave_status,leave_comments,leave_request_id,leave_type_id,employee_id) select MAX(e.leave_id)+1,DATE_ADD('"+newFromDate+"',INTERVAL "+i+" DAY),"+leave_length_hours+","+leave_length_days+",0,'"+req.body.comments+"',max(a.leave_request_id),b.leave_type_id,d.emp_number from hs_hr_leave_requests a,hs_hr_leavetype b,ohrm_user d,hs_hr_leave e where b.leave_type_name='"+req.body.leaveType+"' AND d.user_name='"+req.body.username+"'",function(err,result,fields) {
                                if(err) { throw err;
                                }

                                res.json({duplicate:false});
                            });
                            connection.query("UPDATE hs_hr_leave_requests a, hs_hr_employee_leave_quota b, ohrm_user c,hs_hr_leave_period d SET b.leave_brought_forward=b.leave_brought_forward+"+leave_length_days+"  WHERE a.leave_period_id = b.leave_period_id AND a.employee_id = b.employee_id AND a.leave_type_id = b.leave_type_id AND a.leave_type_name =  '"+req.body.leaveType+"' AND a.employee_id = c.emp_number AND c.user_name =  '"+req.body.username+"' AND d.leave_period_id=b.leave_period_id AND DATE_ADD('"+newFromDate+"',INTERVAL "+i+" DAY) between d.leave_period_start_date AND leave_period_end_date",function(err,result,fields) {
                                if(err) { throw err;
                                }

                                res.json({duplicate:false});
                            });
                          }


                    }

                }
            });
        }
    });

});
app.get('/getDept', function(req, res) {

    connection.query("select title from ohrm_departmentmaster",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.get('/getDesig', function(req, res) {

    connection.query("select title from ohrm_designationmaster",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.get('/getloc', function(req, res) {

    connection.query("select name from ohrm_location",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/postContactSearchForm',function(req,res){
    if(req.body.department=='all'){
        req.body.department='%';
    }
    if(req.body.designation=='all'){
        req.body.designation='%';
    }
    if(req.body.location=='all'){
        req.body.location='%';
    }
    connection.query("select concat(a.emp_firstname,' ',a.emp_lastname) as employee_name,a.emp_work_email,a.emp_department,a.emp_designation,b.name,c.epic_picture from hs_hr_employee a,ohrm_location b,hs_hr_emp_picture c,hs_hr_emp_locations d where a.emp_department like '"+req.body.department+"' AND a.emp_designation like '"+req.body.designation+"' AND b.name like '"+req.body.location+"' AND b.id=d.location_id AND d.emp_number=a.emp_number AND a.emp_number=c.emp_number",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/getLeaveSummary', function(req, res) {

    if(req.body.leaveType=="All")
    {
        req.body.leaveType='%';
    }
    connection.query("SELECT a.leave_type_name, CONCAT( b.emp_firstname,  ' ', b.emp_lastname ) AS emp_fullname, c.no_of_days_allotted, c.leave_taken, c.leave_brought_forward FROM hs_hr_leavetype a, hs_hr_employee b,hs_hr_employee d,ohrm_user e,ohrm_user f, hs_hr_employee_leave_quota c    WHERE a.leave_type_id = c.leave_type_id    AND c.employee_id = b.emp_number    AND a.leave_type_name LIKE  '"+req.body.leaveType+"'    AND c.leave_period_id =  '"+req.body.leave_period+"'    AND e.user_name='"+req.body.username+"'    AND e.emp_number=d.emp_number    AND (d.emp_department=b.emp_department OR d.emp_department='admin')    AND b.emp_number=f.emp_number    AND e.user_role_id=f.user_role_id-1",function(err,result) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/getCurrentBalance',function(req,res){
    //console.log(req.body);
    connection.query("SELECT a.no_of_days_allotted - ( a.leave_taken + a.leave_brought_forward ) AS current_leave_balance, c.leave_type_name FROM hs_hr_employee_leave_quota a, ohrm_user b, hs_hr_leavetype c WHERE a.employee_id = b.emp_number AND b.user_name =  '"+req.body.username+"' AND a.leave_type_id = c.leave_type_id",function(err,result) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/myLeaveList', function(req, res) {

    connection.query("select a.leave_id, DATE_FORMAT(a.leave_date,'%d %M,%Y') as leave_date,b.leave_type_name,a.leave_status,a.leave_comments,a.leave_length_hours from hs_hr_leave a,hs_hr_leavetype b,ohrm_user d where b.leave_type_id=a.leave_type_id AND a.employee_id=d.emp_number AND d.user_name='"+req.body.username+"'",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/cancelPending', function(req, res) {

    connection.query("UPDATE hs_hr_leave a,hs_hr_employee_leave_quota b SET a.leave_status='3',b.leave_brought_forward=b.leave_brought_forward-a.leave_length_days WHERE a.leave_id='"+req.body.leave_id+"' AND a.employee_id=b.employee_id AND a.leave_type_id=b.leave_type_id",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
/*app.post('/leaveGrant',function(req,res){

    connection.query("SELECT a.leave_id, CONCAT( e.emp_firstname,  ' ', e.emp_lastname ) AS emp_fullname, DATE_FORMAT( a.leave_date,  '%d %M,%Y' ) AS leave_date, a.leave_status, a.leave_length_days, a.leave_comments, b.leave_type_name FROM hs_hr_leave a, hs_hr_leavetype b, ohrm_user c, ohrm_user d, hs_hr_employee e, hs_hr_employee f WHERE a.leave_status =0 AND c.user_name = '"+req.body.username+"' AND c.emp_number = f.emp_number AND (f.emp_department = e.emp_department OR f.emp_department =  'admin') AND a.employee_id = e.emp_number AND b.leave_type_id = a.leave_type_id AND c.user_role_id = d.user_role_id -1 AND e.emp_number = d.emp_number",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});*/
app.post('/leaveGrant',function(req,res){
    console.log(req.body);
    var results=[];
    connection.query("SELECT a.leave_id, CONCAT( e.emp_firstname,  ' ', e.emp_lastname ) AS emp_fullname, DATE_FORMAT( a.leave_date,  '%d %M,%Y' ) AS leave_date, a.leave_status, a.leave_length_days, a.leave_comments, b.leave_type_name FROM hs_hr_leave a, hs_hr_leavetype b, ohrm_user c, ohrm_user d, hs_hr_employee e, hs_hr_employee f WHERE a.leave_status =0 AND c.user_name = '"+req.body.username+"' AND c.emp_number = f.emp_number AND (f.emp_department = e.emp_department OR f.emp_department =  'admin') AND a.employee_id = e.emp_number AND b.leave_type_id = a.leave_type_id AND c.user_role_id = d.user_role_id -1 AND e.emp_number = d.emp_number",function(err,result,fields) {
         if(err) { throw err;
        }
        results.push(result);
        connection.query("SELECT DISTINCT CONCAT( e.emp_firstname,  ' ', e.emp_lastname ) AS emp_fullname_grant FROM hs_hr_leave a, hs_hr_leavetype b, ohrm_user c, ohrm_user d, hs_hr_employee e, hs_hr_employee f WHERE a.leave_status =0 AND c.user_name =  '"+req.body.username+"' AND c.emp_number = f.emp_number AND (f.emp_department = e.emp_department OR f.emp_department =  'admin') AND a.employee_id = e.emp_number AND b.leave_type_id = a.leave_type_id AND c.user_role_id = d.user_role_id -1 AND e.emp_number = d.emp_number",function(err,result1,fields) {

               if(err) { throw err;
            }
            results.push(result1);
            console.log(results);
            res.json(results);
        });
    });

});
app.post('/leaveGrantTest',function(req,res){

    connection.query("UPDATE hs_hr_leave a,hs_hr_employee_leave_quota b SET a.leave_status='1',b.leave_taken=b.leave_taken+a.leave_length_days,b.leave_brought_forward=b.leave_brought_forward-a.leave_length_days WHERE a.leave_id='"+req.body.leave_id+"' AND a.employee_id=b.employee_id AND a.leave_type_id=b.leave_type_id",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/leaveRejectTest',function(req,res){

    connection.query("UPDATE hs_hr_leave a,hs_hr_employee_leave_quota b SET a.leave_status='2',b.leave_brought_forward=b.leave_brought_forward-a.leave_length_days WHERE a.leave_id='"+req.body.leave_id+"' AND a.employee_id=b.employee_id AND a.leave_type_id=b.leave_type_id",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.get('/trainingCalendar',function(req,res){
    connection.query("SELECT a.title, DATE_FORMAT(b.date,'%m-%d-%Y') as date FROM trn_courses a, trn_course_times b WHERE a.trn_course_id = b.trn_course_id",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/trainingCalendarTest',function(req,res){
    connection.query("select e.user_name,a.title as course_name,DATE_FORMAT(b.date,'%d %M,%Y') as date,b.start_time,CONCAT(c.emp_firstname,' ',c.emp_lastname) as instructor,d.title as venue,CONCAT(DATE_FORMAT(b.start_time,'%l:%i %p'),' to ',DATE_FORMAT(b.end_time,'%l:%i %p')) as time from trn_courses a,trn_course_times b,hs_hr_employee c,trn_venues d,ohrm_user e where a.title='"+req.body.course_name+"' AND b.date='"+req.body.date+"' AND a.trn_course_id=b.trn_course_id AND a.trn_venue_id=d.trn_venue_id AND a.instructor=c.emp_number AND c.emp_number=e.emp_number",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/trainingCalendarRegistration',function(req,res){

    connection.query("insert into trn_course_registrations(trn_course_registration_id,trn_course_id,emp_number,attend) select max(a.trn_course_registration_id)+1,b.trn_course_id,c.emp_number,'0' from trn_course_registrations a,trn_courses b,ohrm_user c,trn_course_times d where b.title='"+req.body.course_name+"' AND d.date='"+req.body.date+"' AND b.trn_course_id=d.trn_course_id AND c.user_name='"+req.body.user+"'",function(err,result,fields) {
        if(err) { res.json({duplicate:true});
        }
        res.json(result);
    });
});
app.post('/trainingAttended',function(req,res){
    connection.query("SELECT a.title as course_name, e.title as venue, DATE_FORMAT(d.date,'%d %M,%Y') as date, CONCAT( f.emp_firstname,  ' ', f.emp_lastname ) AS instructor FROM trn_courses a, trn_attendances b, ohrm_user c, ohrm_user g, trn_course_times d, trn_venues e, hs_hr_employee f WHERE a.trn_course_id = b.trn_course_id AND b.emp_number = c.emp_number AND a.trn_venue_id = e.trn_venue_id AND a.instructor = g.emp_number AND a.trn_course_id = d.trn_course_id AND c.user_name =  '"+req.body.username+"' AND g.emp_number = f.emp_number AND CONCAT(d.date,' ',d.start_time) < now()",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/trainingAttending',function(req,res){
    connection.query("SELECT a.title as course_name, e.title as venue, DATE_FORMAT(d.date,'%d %M,%Y') as date,DATE_FORMAT( d.start_time,  '%h:%i %p' ) as start_time,DATE_FORMAT( d.end_time,  '%h:%i %p' ) as end_time, CONCAT( f.emp_firstname,  ' ', f.emp_lastname ) AS instructor FROM trn_courses a, trn_course_registrations b, ohrm_user c, ohrm_user g, trn_course_times d, trn_venues e, hs_hr_employee f WHERE a.trn_course_id = b.trn_course_id AND b.emp_number = c.emp_number AND a.trn_venue_id = e.trn_venue_id AND a.instructor = g.emp_number AND a.trn_course_id = d.trn_course_id AND c.user_name =  '"+req.body.username+"' AND g.emp_number = f.emp_number AND CONCAT(d.date,' ',d.start_time) > now()",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/trainingTaught',function(req,res){
    connection.query("SELECT a.title as course_name, e.title as venue, DATE_FORMAT(d.date,'%d %M,%Y') as date FROM trn_courses a, ohrm_user c, trn_course_times d, trn_venues e, hs_hr_employee f WHERE a.instructor = c.emp_number AND a.trn_venue_id = e.trn_venue_id AND a.trn_course_id = d.trn_course_id AND c.user_name =  '"+req.body.username+"' AND c.emp_number = f.emp_number AND CONCAT(d.date,' ',d.start_time)<now()",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/trainingTeaching',function(req,res){
    connection.query("SELECT a.title AS course_name, e.title AS venue, DATE_FORMAT( d.date,  '%d %M,%Y' ) AS date, DATE_FORMAT( d.start_time,  '%h:%i %p' ) as start_time,DATE_FORMAT( d.end_time,  '%h:%i %p' ) as end_time FROM trn_courses a, ohrm_user c, trn_course_times d, trn_venues e WHERE a.instructor = c.emp_number AND a.trn_venue_id = e.trn_venue_id AND a.trn_course_id = d.trn_course_id AND c.user_name =  '"+req.body.username+"' AND CONCAT( d.date,' ',d.start_time) > NOW( ) ",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.get('/getInstructorVenue', function (req, res) {
    var results=[];
    connection.query("select CONCAT(emp_firstname,  ' ', emp_lastname ) as instructor,emp_number from hs_hr_employee order by emp_firstname", function (err, result) {
        if (err) {
            throw err;
        }
        results.push(result);
        connection.query("select trn_venue_id,title from trn_venues order by title", function (err, result) {
            if (err) {
                throw err;
            }
            results.push(result);
            res.json(results)
        });
    });
});
app.post('/addTraining',function(req,res){
    console.log(req.body);
    var datearray1 = req.body.date.split("-");
    var newDate=datearray1[2]+"-"+datearray1[1]+"-"+datearray1[0];
    connection.query("SELECT * FROM trn_courses a, trn_course_times b WHERE (('"+newDate+"' = b.date AND ((TIME_FORMAT( STR_TO_DATE('"+req.body.start_time+"','%r' ),'%T' )>= b.start_time AND TIME_FORMAT(STR_TO_DATE('"+req.body.start_time+"','%r' ),'%T' )<=b.end_time)OR(TIME_FORMAT(STR_TO_DATE('"+req.body.end_time+"','%r'),'%T')>= b.start_time AND TIME_FORMAT( STR_TO_DATE('"+req.body.end_time+"','%r'),'%T' )<=b.end_time)OR(TIME_FORMAT(STR_TO_DATE('"+req.body.start_time+"','%r'),'%T' )<=b.start_time AND TIME_FORMAT(STR_TO_DATE('"+req.body.end_time+"','%r'),'%T' )>=b.end_time)) AND (a.trn_venue_id = '"+req.body.venue+"' OR a.instructor =  '"+req.body.instructor+"')) OR (b.date='"+req.body.date+"' AND a.title='"+req.body.title+"') AND a.trn_course_id = b.trn_course_id) OR (b.date='"+newDate+"' AND a.title='"+req.body.title+"' AND a.trn_course_id = b.trn_course_id)",function(err,result,fields) {
        if(err) { throw err;
        }
        if(result.length>0){
            res.json({conflict:true});
            console.log("yes conflicting");
        }
        else{
            connection.query("insert into trn_courses(trn_course_id,title,description,instructor,trn_venue_id,created_date,updated_date) select max(a.trn_course_id)+1,'"+req.body.title+"','"+req.body.description+"','"+req.body.instructor+"',c.trn_venue_id,CURDATE(),CURDATE() from trn_courses a,hs_hr_employee b,trn_venues c ",function(err,result,fields) {
                if(err) { throw err;
                }
                res.json({conflict:false});
                console.log("data inserted");
            });
            connection.query("insert into trn_course_times(trn_course_time_id,trn_course_id,date,start_time,end_time,duration) select max(b.trn_course_time_id)+1,max(a.trn_course_id),'"+newDate+"',time_format(str_to_date('"+req.body.start_time+"','%r'),'%T') as start_time,time_format(str_to_date('"+req.body.end_time+"','%r'),'%T') as end_time,TIMESTAMPDIFF(SECOND,CONCAT('"+newDate+"',' ','"+req.body.start_time+"'),CONCAT('"+newDate+"',' ','"+req.body.end_time+"')) from trn_courses a,trn_course_times b",function(err,result,fields) {
                if(err) { throw err;
                }
                res.json({conflict:false});
            });
        }

    });
});

app.post('/travelSummary',function(req,res){
    connection.query("SELECT c.status,DATE_FORMAT( c.start_date,  '%d %M,%Y' ) as start_date,DATE_FORMAT( c.end_date,  '%d %M,%Y' ) as end_date, e.title as location_from, f.title as location_to, b.title as mode_of_travel, d.title as travel_type FROM trvl_mode_of_travels b, trvl_travel_requests c, trvl_travel_types d, trvl_travel_locations e, trvl_travel_locations f, ohrm_user g WHERE c.trvl_mode_of_travel_id = b.trvl_mode_of_travel_id AND c.trvl_travel_type_id = d.trvl_travel_type_id AND c.location_from = e.trvl_travel_location_id AND c.location_to = f.trvl_travel_location_id AND g.user_name =  '"+req.body.username+"' AND g.emp_number = c.emp_number",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/travelGrant',function(req,res){
    connection.query("SELECT c.trvl_travel_request_id, CONCAT( h.emp_firstname,  ' ', h.emp_lastname ) AS emp_name, DATE_FORMAT( c.start_date,  '%d %M,%Y' ) AS start_date, DATE_FORMAT( c.end_date,  '%d %M,%Y' ) AS end_date, e.title AS location_from, f.title AS location_to, b.title AS mode_of_travel, d.title AS travel_type    FROM trvl_mode_of_travels b, trvl_travel_requests c, trvl_travel_types d, trvl_travel_locations e, trvl_travel_locations f, ohrm_user g, ohrm_user j, hs_hr_employee h, hs_hr_employee i    WHERE c.trvl_mode_of_travel_id = b.trvl_mode_of_travel_id    AND c.trvl_travel_type_id = d.trvl_travel_type_id    AND c.location_from = e.trvl_travel_location_id    AND c.location_to = f.trvl_travel_location_id    AND g.user_name =  '"+req.body.username+"'    AND g.emp_number = i.emp_number    AND (        h.emp_department = i.emp_department    OR i.emp_department =  'admin'    )    AND h.emp_number = c.emp_number    AND c.status =  'Pending'    AND g.user_role_id = j.user_role_id -1    AND h.emp_number = j.emp_number    ORDER BY start_date",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/travelGrantTest',function(req,res){

    connection.query("UPDATE trvl_travel_requests SET status='Accepted' WHERE trvl_travel_request_id='"+req.body.trvl_travel_request_id+"'",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.post('/travelRejectTest',function(req,res){

    connection.query("UPDATE trvl_travel_requests SET status='Rejected' WHERE trvl_travel_request_id='"+req.body.trvl_travel_request_id+"'",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.get('/getlocations', function(req, res) {

    connection.query("select title from trvl_travel_locations",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.get('/getPeriod', function(req, res) {

    connection.query("select CONCAT(leave_period_start_date,' to ',leave_period_end_date) as leave_period,leave_period_id from hs_hr_leave_period",function(err,result) {
        if(err) { throw err;
        }
        res.json(result);
    });
});

app.post('/travelRequestForm',function(req,res){
    var datearray1 = req.body.start_date.split("-");
    var datearray2 = req.body.end_date.split("-");
    var newStartDate = datearray1[2] + '-' + datearray1[1] + '-' + datearray1[0];
    var newEndDate = datearray2[2] + '-' + datearray2[1] + '-' + datearray2[0];
    connection.query("insert into trvl_travel_requests(purpose_of_travel,trvl_travel_type_id,start_date,end_date,location_from,location_to,trvl_mode_of_travel_id,cab,hotel,extra_informations,trvl_travel_request_id,emp_number,request_by_emp_number,status,created_date,updated_date) select '"+req.body.purpose_of_travel+"',a.trvl_travel_type_id,'"+newStartDate+"','"+newEndDate+"',b.trvl_travel_location_id,c.trvl_travel_location_id,d.trvl_mode_of_travel_id,"+req.body.cab+","+req.body.hotel+",'"+req.body.extra_info+"',MAX(e.trvl_travel_request_id)+1,f.emp_number,f.emp_number,'Pending',CURDATE(),CURDATE() from trvl_travel_types a,trvl_travel_locations b,trvl_travel_locations c,trvl_mode_of_travels d,trvl_travel_requests e,ohrm_user f where a.title='"+req.body.travel_type+"' AND b.title='"+req.body.location_from+"' AND c.title='"+req.body.location_to+"' AND d.title='"+req.body.mode_of_travel+"' AND f.user_name='"+req.body.username+"'",function(err,result,fields) {
        if(err) { throw err;
        }
        res.json(result);
    });
});
app.listen(port);
console.log("App listening on port " + port);