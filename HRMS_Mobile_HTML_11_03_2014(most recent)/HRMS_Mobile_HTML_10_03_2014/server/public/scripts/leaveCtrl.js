hrmsApp.controller('leaveCtrl', function ($scope, $rootScope, loginForm, tabService) {
    loginForm.username = localStorage['username'];
    loginForm.role = localStorage['role'];
    if (loginForm.role == '1') {
        $scope.adminDisabled = "tab-disabled";
        $scope.current2 = "current";
        $scope.current4 = "inr-current";

    }
    else if (loginForm.role == '2') {
        $scope.current2 = "current";
        $scope.current4 = "inr-current";

    }
    else if (loginForm.role == '3') {
        $scope.disabled = "tab-disabled";
        $scope.current2 = "current";
        $scope.current5 = "inr-current";

    }
    $scope.clickLeaveList = function () {
        if (loginForm.role == '1') {

            tabService.loadLeaveGrantList();
        }
        else if (loginForm.role == '2') {

            tabService.loadMyLeaveList();
        }
        else if (loginForm.role == '3') {

            tabService.loadMyLeaveList();
        }
    }
});
hrmsApp.factory('tabService', function () {
    return{
        loadMyLeaveList: "",
        loadLeaveGrantList: ""
    };
});