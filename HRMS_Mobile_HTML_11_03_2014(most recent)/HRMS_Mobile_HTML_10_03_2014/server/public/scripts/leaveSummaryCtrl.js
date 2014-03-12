hrmsApp.controller('leaveSummaryCtrl', function ($scope, $rootScope,$timeout, $http) {
    $scope.leave_period={};
    $scope.toggle=[];
    $scope.rotate=[];
    $scope.firsttime=false;
    $scope.leaveSummaryResult={};
    $scope.leaveSummaryForm={leave_period:"",leaveType:"All",username:localStorage['username']};
        $http.get('/getPeriod')
            .success(function (data) {
                    $scope.leave_period = data;

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            })

    $scope.searchLeaveSummary=function(){
        $scope.firsttime=true;
        $http.post('/getLeaveSummary',$scope.leaveSummaryForm)
            .success(function (data) {
                $scope.leaveSummaryResult= data;

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            })

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
});