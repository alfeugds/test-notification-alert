var app = angular.module('myApp', []);

app.controller('myCtrl', ['$scope', 'notificationAlertService', 'notificationService', function($scope, notificationAlertService, notificationService) {
    $scope.firstName= "John";
    $scope.lastName= "Doe";
    var notificationsList = [],
        currentWidth = document.documentElement.clientWidth,
        widthThreshold = 900;

    function init(){

        showNotifications();

        window.addEventListener('resize', function(event){
            var width = document.documentElement.clientWidth;

            if(!isCurrentWidthLimit(width)){
                currentWidth = width;
                rearrangeNotifications();
            }
            currentWidth = width;
        });
    }

    function isCurrentWidthLimit(newWidth){
        return (currentWidth <= widthThreshold && newWidth <= widthThreshold)
                || (currentWidth > widthThreshold && newWidth > widthThreshold); 
    }

    function notifyCenter(){
        var notification = {
            id:'6',
            title: 'notification hue',
            type: 'critical',
            forceCentralizedAlignment: shouldCentralizeNotifications(),
            createdDate: new Date(),
            isRead: false,
            isShownAsAlert: false
        };
        notificationAlertService.notify(notification);
    }
    function notifyLeft(){
        var notification = {
            id:'5',
            title: 'notification br',
            type: 'non-critical',
            forceCentralizedAlignment: shouldCentralizeNotifications(),
            createdDate: new Date(),
            isRead: false,
            isShownAsAlert: false
        };
        notificationAlertService.notify(notification);
    }

    function showNotifications(){
        var shouldCentralize = shouldCentralizeNotifications();

        notificationsList = notificationService.getNotifications();

        notificationsList.forEach(function(notification){
            notification.forceCentralizedAlignment = shouldCentralize;
            notificationAlertService.notify(notification);
        });
    }

    function clearNotifications(){
        notificationAlertService.clearNotifications();
    }

    function rearrangeNotifications(){
        clearNotifications();
        showNotifications();
    }

    function shouldCentralizeNotifications(){
        return currentWidth <= widthThreshold;
    }

    $scope.notifyCenter = notifyCenter;
    $scope.notifyLeft = notifyLeft;       

    init();
    
}]);

app.factory('notificationService', function(){
    var notificationsList = [
        {
            id:'1',
            title: 'notification 1',
            type: 'non-critical',
            createdDate: new Date('2016-01-02 03:23'),
            isRead: false,
            isShownAsAlert: false
        },
        {
            id:'2',
            title: 'notification 2',
            type: 'non-critical',
            createdDate: new Date('2016-01-02 04:23'),
            isRead: false,
            isShownAsAlert: false
        },
        {
            id:'3',
            title: 'notification 3',
            type: 'critical',
            createdDate: new Date('2016-01-02 05:23'),
            isRead: false,
            isShownAsAlert: false
        },
        {
            id:'4',
            title: 'notification 4',
            type: 'critical',
            createdDate: new Date('2016-01-02 06:23'),
            isRead: false,
            isShownAsAlert: false
        }
    ];
    function getNotifications(){
        return notificationsList;
    };

    function addNotification(notification){
        notificationsList.push(notification);
    };

    return {
        getNotifications: getNotifications,
        addNotification: addNotification
    }
});

app.factory('notificationAlertService', ['$window', function($window){

    var positions = {
        "critical": {
            position: 'top center',
            isModal: false,
            autoHideDelay: 000,
        },
        "non-critical": {
            position: 'bottom left',
            isModal: false,
            autoHideDelay: 000,
        }    
    }
    
    $.notify.addStyle('custom-notification', {
        html: 
            '<div><a href="#" data-object-id=""><div class="notification-alert non-critical">'+
                '<div class="notification-alert image">'+
                    'image'+
                '</div>'+
                '<div>'+
                    '<div class="notification-alert text" data-notify-html="title">Notification Text</div>'+
                    '<div data-notify-html="createdTimeText"></div>'+
                '</div>'+
            '</div></a></div>'
    });

    function showNotification(notification, options){

        $.notify({
            title: notification.title,
            createdTimeText: '4 hours ago'
        }, { 
            style: 'custom-notification',
            clickToHide: true,
            position: options.position,
            // show animation
            showAnimation: 'slideDown',
            // show animation duration
            showDuration: 00,
            // hide animation
            hideAnimation: 'slideUp',
            // hide animation duration
            hideDuration: 00,
            // whether to auto-hide the notification
            autoHide: options.autoHide,
            // if autoHide, hide after milliseconds
            autoHideDelay: options.autoHideDelay,

            className: 'test ' + notification.type + (options.isModal ? ' modal-alert' : '') 
        });

        //handle centering the modal alerts
        if(options.isModal){
            var notifyJsCorner = $('.notifyjs-container .critical').parent().parent().parent();
            notifyJsCorner
                .css('left','50%')
                .css('top','50%')
                .css('transform','translate(-50%,-50%)')
                .css('z-index','1065');
        }
        /*
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
        */ 

        //workaround for 'center' notifications.
        //see bug https://github.com/notifyjs/notifyjs/issues/74
        else if(options.position && options.position.includes('center')){
            var notifyJsCorner = $('.notifyjs-corner').filter(function() {
                return this.style.left === '45%';
            });
            notifyJsCorner
                .css('left','50%')
                .css('margin-left','-150px');
        }

        
        
    }

    function getAlignmentConfiguration(type){
        return positions[type];
    }

    function getDefaultAlignmentPosition(){
        var criticalConfiguration = getAlignmentConfiguration('critical'),
            nonCriticalConfiguration = getAlignmentConfiguration('non-critical');

        if(!criticalConfiguration.isModal){
            return criticalConfiguration.position;
        }

        if(!nonCriticalConfiguration.isModal){
            return nonCriticalConfiguration.position;
        }

        return 'bottom left';
    }

    function getModalAlignmentPosition(){
        return 'top center';
    }

    function notify(notification){
        var maxSimultaneousNotifications = 6;
        if($('.notifyjs-wrapper').length < maxSimultaneousNotifications){
            var options,
                notificationTypeConfiguration = getAlignmentConfiguration(notification.type),
                position = notificationTypeConfiguration.position;

            if(notification.forceCentralizedAlignment){
                var defaultPosition = getDefaultAlignmentPosition();
                if(defaultPosition.includes('top')){
                    position = 'top center';    
                } else {
                    position = 'bottom center';
                } 
            }

            options = {
                position: position,
                autoHideDelay: notificationTypeConfiguration.autoHideDelay,
                autoHide: notificationTypeConfiguration.autoHideDelay > 0,
                isModal: notificationTypeConfiguration.isModal
            };
            showNotification(notification, options);
            handleModalAlertsMask();
        }
    };

    function clearNotifications(){
        $('.notifyjs-corner').html('');
    }

    function handleModalAlertsMask(){
        if($('.notifyjs-container .critical.modal-alert').length > 0){
            $('.notification-modal-mask').show();
        } else {
            $('.notification-modal-mask').hide();
        }
    }

    function init(){
        //handle critical notification clicks
        $(document).on('click', '.notifyjs-container .critical', function(){
            handleModalAlertsMask();
            console.log('clicked critical')
        })
    }

    init();

    return {
        notify: notify,
        clearNotifications: clearNotifications
    };
}]);