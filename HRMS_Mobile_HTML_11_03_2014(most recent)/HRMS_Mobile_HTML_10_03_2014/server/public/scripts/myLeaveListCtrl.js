hrmsApp.controller('myLeaveListCtrl', function ($scope, $rootScope, $http, loginForm,tabService) {
    $scope.myLeavelist = {};
    $scope.leaveStatus = "All";
    $scope.leaveType = "All";
    $scope.toggle=[];
    $scope.rotate=[];
    loginForm.username = localStorage['username'];
    preloader_enter();
    tabService.loadMyLeaveList = function () {
        $scope.inrcurrent = "LeaveList";
        preloader_enter();
        $http.post('/myLeaveList', loginForm)
            .success(function (data) {
                $scope.myLeavelist = data;

                preloader_exit();

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.loadMyLeaveList = tabService.loadMyLeaveList;

    tabService.loadLeaveGrantList = function () {
        $scope.inrcurrent = "GrantRequest";
        preloader_enter();
        $http.post('/leaveGrant', loginForm)
            .success(function (data) {
                console.log(data);
                $scope.leaveGrantList = data;
                preloader_exit();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.loadLeaveGrantList = tabService.loadLeaveGrantList;
    $scope.cancelPending = function (a) {
        var cancelPending = {leave_id: a};
        $http.post('/cancelPending', cancelPending)
            .success(function (data) {
                toastr.success("Your pending request is cancelled!");
                tabService.loadMyLeaveList();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.grantLeave = function (a) {
        var leavePendingList = {leave_id: a};
        $http.post('/leaveGrantTest', leavePendingList)
            .success(function (data) {
                toastr.success("leave request successfully granted");
                $scope.loadLeaveGrantList();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.rejectLeave = function (a) {
        var leavePendingList = {leave_id: a};
        $http.post('/leaveRejectTest', leavePendingList)
            .success(function (data) {
                toastr.success("leave request successfully rejected");
                $scope.loadLeaveGrantList();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.clickToggle = function(index){
        angular.forEach($scope.toggle,function(value,key){
            if($scope.toggle[key]==true && key != index)
            {
                $scope.toggle[key]= false;
                $scope.rotate[key] = "";
            }
        });
        $scope.toggle[index]=!$scope.toggle[index];

        if ($scope.rotate[index] == "" || !$scope.rotate[index])
            $scope.rotate[index] = "animate-rotate";
        else
            $scope.rotate[index] = "";
    }
    if(loginForm.role=='3')
    {
        $scope.disabled = "tab-disabled";
        tabService.loadMyLeaveList();
    }
    if(loginForm.role=='1')
    {
        $scope.adminDisabled = "tab-disabled";
        tabService.loadLeaveGrantList();
    }
    if(loginForm.role=='2')
    {
        tabService.loadLeaveGrantList();
    }

});
hrmsApp.filter('searchForLeave', function () {
    return function (arr, leaveType) {
        if (leaveType == 'All') {
            return arr;
        }
        var result = [];
        leaveType = leaveType.toLowerCase();

        angular.forEach(arr, function (myLeavelist) {

            if (myLeavelist.leave_type_name.toLowerCase().indexOf(leaveType) !== -1) {
                result.push(myLeavelist);
            }
        });

        return result;
    };

});
hrmsApp.filter('searchForLeaveDate', function () {
    return function (arr, startDate, endDate) {
        if ((startDate == undefined || startDate == "") && (endDate == undefined || endDate == "")) {
            return arr;
        }
        var result = [];
        if (startDate != undefined) {
            var datearray1 = startDate.split("-");
            var newStart = datearray1[1] + '-' + datearray1[0] + '-' + datearray1[2];
            var start = new Date(newStart);
        }
        if (endDate != undefined) {
            var datearray2 = endDate.split("-");
            var newEnd = datearray2[1] + '-' + datearray2[0] + '-' + datearray2[2];
            var end = new Date(newEnd);
        }
        angular.forEach(arr, function (myLeavelist) {
            if (new Date(myLeavelist.leave_date) >= start && (endDate == undefined || endDate == "")) {
                result.push(myLeavelist);
            }
            else if ((startDate == undefined || startDate == "") && new Date(myLeavelist.leave_date) <= end) {
                result.push(myLeavelist);
            }
            else if (new Date(myLeavelist.leave_date) >= start && new Date(myLeavelist.leave_date) <= end) {
                result.push(myLeavelist);
            }
        });

        return result;
    };

});
hrmsApp.filter('sortDI', function () {
    return function (arr) {

        if (arr.length > 0) {
            arr.sort(function (obj1, obj2) {
                    var c = new Date(obj1.leave_date);
                    var d = new Date(obj2.leave_date);
                    return d - c;

            });
        }
        return arr;
    }
});
hrmsApp.filter('parseStatus', function () {
    return function (arr, leaveStatus) {
        if (leaveStatus == "All") return arr;
        var result = [];
        angular.forEach(arr, function (myLeaveList) {
            if (myLeaveList.leave_status == leaveStatus) {
                result.push(myLeaveList);
            }
        });
        return result;
    }
});