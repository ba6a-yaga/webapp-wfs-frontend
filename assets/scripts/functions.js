
function updateUserList(){
    $('.userListItem tbody').html(tmpl.userListItem.render())
}

function getUser(){
    return window.UserData;
}

function formatDate(dateString){
    var date = new Date(dateString);
    if(isNaN(date) )
    return "";
    return  date.getDate() + "-" + date.getMonth() + "-"+date.getFullYear();
}

function convertBalance(balance){
    return Number(balance).toFixed(2)
}

function isMe(phone){
    return Number(phone) == Number(UserData.phone)
}

function getDiscount(){
    return Cookies.get('discount')
}

function isMobile(){
    return isMobile;
}

function activeTabs(){
    setTimeout(function(){
        $('body .nav li:first a').click()
    },100)
    
}


function getLinkParam(param){
    return windowHref.searchParams.get(param)
}

function sumArray(array){
    if(array.length)
        return array.reduce(function(accumulator, currentValue){return accumulator + currentValue})
    else
        return 0;
}


function home(){
    return originUrl;
}

function hideCard(card){
    return card.replace(/\d(?=\d{4})/g, "*");
}
$.views.helpers({hideCard: hideCard, home: home, sumArray: sumArray, getLinkParam: getLinkParam, activeTabs: activeTabs, isMobile: isMobile, getUser:getUser,formatDate:formatDate, convertBalance:convertBalance, isMe: isMe, getDiscount: getDiscount, round: Math.round });

function reloadDashboard(){
    getAjaxData('/users/current',{},function(response){
        window.UserData = response.user;
        $('#wrapper').html(tmpl.dashboard.render())    
        $('body')
            .addClass('layout-fullwidth')
    },'GET', 'Reload Dashboard', false);
    
}


function loadUserData(){
    getAjaxData('/users/current',{},function(response){
        window.UserData = response.user;

    },'GET', 'loadUserData', false);
    
}


function getFormData(form){
    var data = {};

    form.serializeArray().forEach(function(item){
        data[item.name] = item.value;
    })
    return data;
}


function getAjaxData( path, query, callback, type, stamp, async = true ){


    if( !isset( type ) )
        type = 'POST'

    if( !isset( stamp ) )
        stamp = 'NoStamp';


    if(Cookies.get('Auth')){
        var headers = {
            'Authorization': "Token "+Cookies.get('Auth')
        };
    }else{
        var headers = '';
    }

    $.ajax({
        async: async,
        type : type,
        url : urlApi+path,
        dataType : 'json',
        cache : false,
        data : JSON.stringify(query),
        contentType: "application/json; charset=utf-8",
        headers: headers,
        statusCode: {
            401: function(response) {
                logs(response)
                return true;
            },
            422: function(response) {
                logs(response);
            }
        },
        success : function( data ){           
            if( isset( window.logs ) )
                logs( '[++AjaxQuery-->' + stamp + '++]', { query : query, result : data } );

            callback( data );
        },

        error : function ( XMLHttpRequest, textStatus, errorThrown ) {

            if( textStatus == 'parsererror' ){
                console.log( XMLHttpRequest.responseText );
            }
        
        }
    
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.statusText.indexOf('NetworkError'))
        if(jqXHR.statusText.indexOf('NetworkError') >= 0){
            alert('Server is down')
        }
    });

}

// Логирование
function init_logs( trigger ){

    if( trigger ){
        
        if( isset( window.console ) && typeof arguments != 'undefined' )
            if( isset( console.log.bind ) )
                window.logs =  console.log.bind( console );
            else
                window.logs = function(){
                    console.log(arguments)
                }
        else
            window.logs = function(){}

        window.myalert = alert;
        
    }else{
        
        window.myalert = function(){};
        window.logs	= function(){}
    }

}

function isset(e){
	
    if( typeof e != 'undefined' && e != '' && typeof e != 'object' )
        return true;
    else if( typeof e == 'object' ){
        for( var key in e ){
            if( typeof e[key] != 'undefined' )
                return true;
        }

        return false;
    }else
        return false;

}

