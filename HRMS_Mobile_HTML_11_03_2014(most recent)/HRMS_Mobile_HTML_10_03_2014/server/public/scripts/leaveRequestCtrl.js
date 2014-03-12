hrmsApp.controller('leaveRequestCtrl', function ($scope, $http, leaveForm) {

    $scope.fromDate = "";
    $scope.toDate = "";
    $scope.half_day = false;
    $scope.leaveRequestStatus = {};

    $http.post('/getCurrentBalance',{username:localStorage['username']})
        .success(function (data) {
            $scope.leave_balance = data;
        })
        .error(function (data) {
            toastr.info("Unknown error occured. Please check your network connection");
        })
    $scope.leaveApply = function () {
        preloader_enter();
        leaveForm.fromDate = $scope.fromDate;
        leaveForm.toDate = $scope.toDate;
        leaveForm.half_day = $scope.half_day;
        leaveForm.leaveType = $scope.leaveType;
        leaveForm.comments = $scope.comments;
        leaveForm.username = localStorage['username'];


        if($scope.fromDate != "" && $scope.fromDate != undefined && $scope.toDate != "" && $scope.toDate != undefined && $scope.leaveType !=undefined)
        {
        $http.post('/leaveApplication', leaveForm)
            .success(function (data) {


                $scope.leaveRequestStatus = data;

                preloader_exit();
                toastr.options.closeButton = true;
                if($scope.leaveRequestStatus.leave_exceeded)
                {
                    toastr.warning("you dont have enough leave balance");
                }
                else {if($scope.leaveRequestStatus.duplicate){
                    toastr.warning("leave already requested for this date");
                }
                else{
                    toastr.success("Leave successfully applied..");
                }
                }
            })
            .error(function (data) {
               preloader_exit();
                toastr.warning("Unknown error occured. Please check your netowrk connection.")
            });
        }
        else
        {
            toastr.info("Please fill the required fields.");
            preloader_exit();

        }

    };

});

hrmsApp.factory('leaveForm', function () {
    return {fromDate: "", toDate: "", leaveType: "", comments: "", half_day: "", username: ""};
});