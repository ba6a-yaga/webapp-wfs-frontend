
function updateUserList(){
    $('.userListItem tbody').html(tmpl.userListItem.render())
}

function getUser(){
    return window.UserData;
}

function formatDate(dateString){
    var date = new Date(dateString);
    return  date.getDate() + "-" + date.getMonth() + "-"+date.getFullYear()+" " + date.getHours() + ":" + date.getMinutes();
}

function convertBalance(balance){
    return Number(balance).toLocaleString('ru-RU')
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

$.views.helpers({isMobile: isMobile, getUser:getUser,formatDate:formatDate, convertBalance:convertBalance, isMe: isMe, getDiscount: getDiscount });

function getFormData(form){
    var data = {};
    form.find('input').each(function(){
        var name = $(this).attr('name');
        var value = $(this).val();
        data[name] = value;
    })
    return data;
}


function makePayment(amount,description){
    var query = {
        "amount": {
          "value": amount,
          "currency": "RUB"
        },
        "capture": true,
        "confirmation": {
          "type": "redirect",
          "return_url": "https://www.wfs.com/"
        },
        "description": description
      };

    $.ajax({
        type : 'POST',
        url : 'https://payment.yandex.net/api/v3/payments',
        dataType : 'json',
        cache : false,
        data : query,
        contentType: "application/json",
        headers: {
            'Idempotence-Key' : uuidv4(),
            '635105': 'test_NjM2Mzk28pZuzy3CkilnQvxwac-HWJFDDRykgOkBhUw'
        },
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
            
            logs(data)
        },

        error : function ( XMLHttpRequest, textStatus, errorThrown ) {

            console.log(errorThrown)
            if( textStatus == 'parsererror' ){
                console.log( XMLHttpRequest.responseText );
            }
        
        }
    
    });    
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

function getAjaxData( path, query, callback, type, stamp ){


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
        async: true,
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

            callback(errorThrown)
            if( textStatus == 'parsererror' ){
                console.log( XMLHttpRequest.responseText );
            }
        
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

