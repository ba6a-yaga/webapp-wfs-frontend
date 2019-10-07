
function updateUserList(){
    $('.userListItem tbody').html(tmpl.userListItem.render())
}

function getUser(){
    return window.UserData;
}

function formatNumber(number) {
  var decimals = 2;
  var dec_point = '.';
  var separator = ' ';

  var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = (typeof separator === 'undefined') ? ',' : separator ,
      dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
      s = '',
      toFixedFix = function(n, prec) {
        var k = Math.pow(10, prec);
        return '' + (Math.round(n * k) / k)
            .toFixed(prec);
      };
  // Фиксим баг в IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
      .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
          .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
        .join('0');
  }
  return s.join(dec);
}

function formatDate(dateString){
    var date = new Date(dateString);
    if(isNaN(date) )
    return "";
    return  date.getDate() + "." + (date.getMonth()<10 ? ("0"+date.getMonth()) : date.getMonth())  + "."+date.getFullYear();
}

function convertBalance(balance){
    return formatNumber(Number(balance).toFixed(2))
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
        return array.reduce(function(accumulator, currentValue){return Number(accumulator) + Number(currentValue) })
    else
        return 0;
}


function home(){
    return originUrl;
}

function hideCard(card){
    return card.replace(/\d(?=\d{4})/g, "*");
}

function sumRefPayments(array){
    var sum = 0;
    for(i in array){
        sum = sum+Number(array[i].amount)
    }

    return sum.toFixed(2);
}
$.views.helpers({formatNumber: formatNumber, sumRefPayments:sumRefPayments, hideCard: hideCard, home: home, sumArray: sumArray, getLinkParam: getLinkParam, activeTabs: activeTabs, isMobile: isMobile, getUser:getUser,formatDate:formatDate, convertBalance:convertBalance, isMe: isMe, getDiscount: getDiscount, round: Math.round });

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

        if(item.name == 'phone' )
            item.value = item.value.replace(/[^-0-9]/gim,'');
        

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

