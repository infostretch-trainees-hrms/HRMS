
var hrmsApp=angular.module('hrmsprojectApp',['ngRoute','ngAnimate']);
hrmsApp.controller('loginCtrl',function($scope, $http,$location,loginForm) {
    $scope.formData=loginForm;
    $scope.loginCheck = function () {

        $http.post('/loginCheck',$scope.formData)
            .success(function (data) {
                $scope.result=data;

                if($scope.result.status==3)
                {   localStorage['auth']='true';
                    localStorage['username']=$scope.formData.username;
                    localStorage['role'] = $scope.result.role;
                    $location.url("/home");
                }
                else
                {

                    switch($scope.result.status)
                    {
                        case 0: toastr.info("Username or password is missing");
                            break;
                        case 1: toastr.info("Username is incorrect");
                            break;
                        case 2: toastr.info("Password is incorrect");
                    }
                }
            })
            .error(function (data) {
                toastr.info("Unknown error occured. Please check your network connection");
            });
    };
    $scope.logout= function(){
        localStorage['auth']='false';
        localStorage['username']='';

    }
});

hrmsApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/home', {
                templateUrl: 'home.html'
            }).when('/',{
                templateUrl: 'login.html'
            }).when('/contacts',{
                templateUrl:'contacts.html'
            }).when('/leave',{
                templateUrl:'leave-balance.html'
            }).when('/travel',{
                templateUrl:'travel.html'
            }).when('/training',{
                templateUrl:'training.html'
            })
            .otherwise({
                redirectTo:'/home'
            });


    }]);

hrmsApp.run(function($rootScope, $location,$route) {
    $rootScope.$on('$routeChangeStart', function(evt) {
        if(!(localStorage['auth']) || localStorage['auth']=='false')
        {
            $location.url("/");
        }
        else if($location.url() == '/')
        {
            if($route.current)
                if($route.current.originalPath == "")
                {
                    $location.url("/home");
                }
            else{
                $location.url($route.current.$$route.originalPath);
                }
        }
        event.preventDefault();
    });
    $rootScope.$on('$routeChangeSuccess', function(evt) {
    });
    toastr.options={ "closeButton":true,"positionClass": "toast-top-full-width" }

})
hrmsApp.factory('loginForm',function(){
    return {username:"",password:"", role:""};
});
