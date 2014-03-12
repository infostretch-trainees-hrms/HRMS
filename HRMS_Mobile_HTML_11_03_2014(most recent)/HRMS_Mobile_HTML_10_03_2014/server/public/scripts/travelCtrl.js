hrmsApp.controller('travelCtrl', function ($scope, $http, loginForm, travelForm) {
    $scope.start_date="";
    $scope.end_date="";
    $scope.travelSummary = {};
    $scope.toggle = [];
    $scope.rotate = [];
    $scope.cab = "false";
    $scope.hotel = "false";
    $scope.travelStatus = "All";
    $scope.travelLocations = {};
    loginForm.username = localStorage['username'];
    loginForm.role = localStorage['role'];
    $scope.travelApply = function () {
        travelForm.purpose_of_travel = $scope.purpose_of_travel;
        travelForm.travel_type = $scope.travel_type;
        travelForm.start_date = $scope.start_date;
        travelForm.end_date = $scope.end_date;
        travelForm.location_from = $scope.location_from;
        travelForm.location_to = $scope.location_to;
        travelForm.mode_of_travel = $scope.mode_of_travel;
        travelForm.cab = $scope.cab;
        travelForm.hotel = $scope.hotel;
        travelForm.extra_info = $scope.extra_info;
        travelForm.username = localStorage['username'];
        if ($scope.purpose_of_travel != "" && $scope.purpose_of_travel != undefined && $scope.travel_type != "" && $scope.travel_type != undefined && $scope.start_date != undefined && $scope.startDate != "" && $scope.end_date != undefined && $scope.end_date != "" && $scope.location_from != "" && $scope.location_from != undefined && $scope.location_to != "" && $scope.location_to != undefined && $scope.mode_of_travel != "" && $scope.mode_of_travel != undefined) {
            $http.post('/travelRequestForm', travelForm)
                .success(function (data) {
                    toastr.success("Travel request applied successfully");
                })
                .error(function (data) {
                    toastr.info("Error while applying travel request.Please input all the necessary fields.");
                });
        }
        else {
            toastr.info("Please fill the required fields.");
        }
    };
    $scope.loadSummary = function () {

        preloader_enter();
        $http.post('/travelSummary', loginForm)
            .success(function (data) {
                $scope.travelSummary = data;
                preloader_exit();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    }
    $scope.loadGrantList = function () {
        preloader_enter();
        $http.post('/travelGrant', loginForm)
            .success(function (data) {
                $scope.travelGrantList = data;

                preloader_exit();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    }
    $http.get('/getLocations')
        .success(function (data) {
            $scope.travelLocations = data;
        })
        .error(function (data) {
            toastr.info("Unknown error occured. Please check your network connection");
        });
    $scope.grantTravel = function (a) {
        preloader_enter();
        var travelPendingList = {trvl_travel_request_id: a};
        $http.post('/travelGrantTest', travelPendingList)
            .success(function (data) {
                toastr.success("travel request successfully granted");
                $scope.loadGrantList();
                preloader_exit();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.rejectTravel = function (a) {
        preloader_enter();
        var travelPendingList = {trvl_travel_request_id: a};
        $http.post('/travelRejectTest', travelPendingList)
            .success(function (data) {
                toastr.success("travel request successfully rejected");
                $scope.loadGrantList();
                preloader_exit();
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.clickToggle = function (index) {
        angular.forEach($scope.toggle, function (value, key) {

            if ($scope.toggle[key] == true && key != index) {
                $scope.toggle[key] = false;
                $scope.rotate[key] = "";
            }
        });
        $scope.toggle[index] = !$scope.toggle[index];

        if ($scope.rotate[index] == "" || !$scope.rotate[index])
            $scope.rotate[index] = "animate-rotate";
        else
            $scope.rotate[index] = "";
    }
    if (loginForm.role == '3') {
        $scope.disabled = "tab-disabled";
        $scope.current1 = "current";
        $scope.current3 = "";
        $scope.loadSummary();
    }
    if (loginForm.role == '1') {
        $scope.adminDisabled = "tab-disabled";
        $scope.current1 = "";
        $scope.current3 = "current";
        $scope.loadGrantList();
    }
    if (loginForm.role == '2') {
        $scope.loadSummary();
        $scope.current1 = "current";
    }
});
hrmsApp.filter('searchForTravel', function () {
    return function (arr, travelStatus) {
        if (travelStatus == 'All') {
            return arr;
        }
        var result = [];
        travelStatus = travelStatus.toLowerCase();

        angular.forEach(arr, function (travelSummary) {

            if (travelSummary.status.toLowerCase().indexOf(travelStatus) !== -1) {
                result.push(travelSummary);
            }
        });

        return result;
    };

});
hrmsApp.factory('travelForm', function () {
    return {purpose_of_travel: "", travel_type: "", start_date: "", end_date: "", location_from: "", location_to: "", mode_of_travel: "", cab: "0", hotel: "0", extra_info: "", username: ""};
});