hrmsApp.controller('contactsCtrl', function ($scope,$http) {
    $scope.toggle=[];
    $scope.rotate=[];
    $scope.all_department;
    $scope.all_designation;
    $scope.all_location;
    $scope.firsttime=false;
    $scope.contactsSearch={department:"all",designation:"all",location:"all"};
    $scope.contactsSearchResult={};
    preloader_enter();
    preloader_exit();
    $http.get('/getDept')
        .success(function (data) {
            $scope.all_department=data;
        })
        .error(function (data) {
            toastr.info("Unknown error occured. Please check your network connection");
        });
    $http.get('/getDesig')
        .success(function (data) {
            $scope.all_designation=data;
        })
        .error(function (data) {
            toastr.info("Unknown error occured. Please check your network connection");
        });
    $http.get('/getloc')
        .success(function (data) {
            $scope.all_location=data;
        })
        .error(function (data) {
            toastr.info("Unknown error occured. Please check your network connection");
        });
    $scope.searchContacts=function(){
        $scope.firsttime=true;
        $http.post('/postContactSearchForm',$scope.contactsSearch)
            .success(function (data) {
                $scope.contactsSearchResult=data;

            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.clickToggle = function(index){
        angular.forEach($scope.toggle,function(value,key){
            if($scope.toggle[key]==true && key != index)
            {
                $scope.toggle[key] = false;
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
hrmsApp.filter('searchFor', function(){
    return function(arr, searchString){
        if(!searchString){
            return arr;
        }
        var result = [];
        searchString = searchString.toLowerCase();

        angular.forEach(arr, function(contactsSearchResult){
            if(contactsSearchResult.employee_name.toLowerCase().indexOf(searchString) !== -1){
                result.push(contactsSearchResult);
            }

        });

        return result;
    };

});
