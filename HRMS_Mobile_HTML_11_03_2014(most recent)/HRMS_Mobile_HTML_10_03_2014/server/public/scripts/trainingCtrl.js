hrmsApp.controller('trainingCtrl', function ($scope, $http, loginForm) {
    $scope.attended = {};
    $scope.attending = {};
    $scope.taught = {};
    $scope.teaching = {};
    $scope.trainingForm={};
    $scope.toggle_inr = [
        [],
        [],
        [],
        []
    ];
    $scope.rotate = [
        [],
        [],
        [],
        []
    ];
    loginForm.username = localStorage['username'];
    $scope.clickCourses = function () {
        preloader_enter();
        $http.post('/trainingAttended', loginForm)
            .success(function (data) {
                $scope.attended = data;

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
        $http.post('/trainingAttending', loginForm)
            .success(function (data) {
                $scope.attending = data;

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
        $http.post('/trainingTaught', loginForm)
            .success(function (data) {
                $scope.taught = data;

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
        $http.post('/trainingTeaching', loginForm)
            .success(function (data) {
                $scope.teaching = data;

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
        preloader_exit();
    }
    $scope.loadAddTraining = function(){
        preloader_enter();
        $http.get('/getInstructorVenue')
            .success(function (data) {
                $scope.instructors_list = data[0];
                $scope.instructor=$scope.instructors_list[0].instructor;
                $scope.course_venue=data[1];
                preloader_exit();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    }
    $scope.clickToggle = function (index, tabIndex) {
        angular.forEach($scope.toggle_inr[tabIndex], function (value, key) {
            if ($scope.toggle_inr[tabIndex][key] == true && key != index) {
                $scope.toggle_inr[tabIndex][key] = false;
                $scope.rotate[tabIndex][key] = "";
            }
        });
        $scope.toggle_inr[tabIndex][index] = !$scope.toggle_inr[tabIndex][index];

        if ($scope.rotate[tabIndex][index] == "" || !$scope.rotate[tabIndex][index])
            $scope.rotate[tabIndex][index] = "animate-rotate";
        else
            $scope.rotate[tabIndex][index] = "";
    }
    $scope.addTraining = function(){
        if($scope.trainingForm.title != "" && $scope.trainingForm.title != undefined && $scope.trainingForm.description != "" && $scope.trainingForm.description != undefined && $scope.trainingForm.date !=undefined && $scope.trainingForm.date !="" && $scope.trainingForm.start_time !="" && $scope.trainingForm.start_time !=undefined && $scope.trainingForm.end_time !="" && $scope.trainingForm.end_time !=undefined && $scope.trainingForm.instructor !="" && $scope.trainingForm.instructor !=undefined && $scope.trainingForm.venue !="" && $scope.trainingForm.venue !=undefined  )
        {
        preloader_enter();

        $http.post('/addTraining',$scope.trainingForm)
            .success(function (data) {
                console.log(data);
                preloader_exit();
                if(!(data.conflict))
                toastr.success("New training event has been successfully added");
                else
                toastr.warning("the time slot or instructor already busy or same topic lecture is already registered!");

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
        }
        else
        {
            toastr.warning("Please fill the required fields");
        }

    }
    $scope.isAdmin = localStorage['role']=='1';
});