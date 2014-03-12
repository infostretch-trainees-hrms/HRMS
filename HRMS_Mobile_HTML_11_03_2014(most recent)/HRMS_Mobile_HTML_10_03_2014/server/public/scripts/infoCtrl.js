/**
 * Created by ispluser on 2/5/14.
 */
hrmsApp.controller('infoCtrl',function($scope,$http,loginForm) {
    $scope.info={};
    preloader_enter();
    loginForm.username=localStorage['username'];
    loginForm.role=localStorage['role'];
    $http.post('/home',loginForm)
        .success(function (data) {
            $scope.info=data;
            preloader_exit();

        })
        .error(function (data) {
            toastr.info("Unknown error occured. Please check your network connection");
        });
});