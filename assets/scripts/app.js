var urlApi = 'http://localhost:8090/api';



$(document).ready(function() {
    init_logs( true );



    tmpl = {
        login: $.templates("#login"),
        register: $.templates("#register"),
        dashboard: $.templates("#dashboard"),
        userListItem: $.templates("#userListItem"),
        transactions: $.templates('#transactionItems')
    }

    getAjaxData('/users/current',{},function(response){
        if( response == 'Unauthorized'){
            $('#wrapper').html(tmpl.login.render())
        }else{
            window.UserData = response.user;
            $('#wrapper').html(tmpl.dashboard.render())            
        }

        $('body')
            .removeClass('ajaxloader')
            .addClass('layout-fullwidth')
    },'GET', 'Get current');


    $('body').on('click', '[data-action="logout"]', function(e){
        e.preventDefault();
        Cookies.remove('Auth');
        $('#wrapper').html(tmpl.login.render())
    })


    $('body').on('click', '[data-action="register"]', function(e){
        e.preventDefault();
        $('#wrapper').html(tmpl.register.render())
    }) 

    $('body').on('click', '[data-action="login"]', function(e){
        e.preventDefault();
        $('#wrapper').html(tmpl.login.render())
    })        


    $('body').on('submit', 'form[data-action="userSearch"]', function(e){
        e.preventDefault();
        var form = $(this);
        var query = form.find('input').val();
        form.find('button[type="submit"]').attr("disabled", true);

        if(query.length){
            action = '/users/search/'
        }else{
            action = '/users/list'
        }

        getAjaxData(action+query,{}, function(response){
            if( response.status == 'success' ){
                form.find('button[type="submit"]').attr("disabled", false);
                window.UserData.listUsers = response.users;
                updateUserList()
            }
         
        },'GET',action)

    })

    $('body').on('submit', 'form[data-form="true"]', function(e){
        e.preventDefault();

        var form = $(this);
        var data = getFormData(form)

        console.log('form')

        var transfer = function(response){
            if( response.status == 'success' ){
                getAjaxData('/transactions',{},function(res){
                    UserData.transactions = res.transactions;
                    var transactionsHtml = tmpl.transactions.render();
                    $('body').find('#transactions tbody').html(transactionsHtml)
                },'GET','load transactions')

                form.find('.alert-success').show()
                form.find('.alert-danger').hide()
                setTimeout(function(){
                    form.find('.alert-success').hide()
                },5000)

                form.find('input').each(function(el){
                    logs($(this))
                    $(this).val('')
                })
            }else{
                form.find('.alert-danger').text(response.textErr).show()
            }
        }

        var login = function(response){
            if( response.status == 'success' ){
                window.UserData = response.user;
                Cookies.set('Auth', response.user.token);
                $('#wrapper').html(tmpl.dashboard.render())   
            }else{
                form.find('.alert-danger').text(response.textErr).show()
            }
        }

        var register = function(response){
            if( response.status == 'success' ){
                $('#wrapper').html(tmpl.login.render())   
            }else{
                form.find('.alert-danger').text(response.textErr).show()
            }            
        }
        
        form.find('button[type="submit"]').attr("disabled", true);
        form.find('button[type="submit"] i').removeClass('d-none')

        getAjaxData(form.attr('action'),{input: data}, function(response){

            form.find('button[type="submit"]').attr("disabled", false);
            form.find('button[type="submit"] i').addClass('d-none')

            if( form.attr('action') == '/users/login' )
                login(response)

            if( form.attr('action') == '/transactions/transfer' )
                transfer(response)
            
            if( form.attr('action') == '/users' )
                register(response)                
        },'POST',form.attr('action'))

        return false;
    })


    $('body').on('click', '[data-rmuser]',function(e){
        var userid = $(this).attr('data-rmuser');
        var isDelete = confirm("Вы точно хотите удалить этого пользователя?");
        
        if( isDelete )
            getAjaxData('/users/delete/'+userid,{}, function(response){
                if(response.status == 'success'){
                    $('body').find(".user-"+userid ).remove()
                }else{
                    alert(response.textErr)
                }
            },'DELETE','delete user')
    })    

})


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

$.views.helpers({getUser:getUser,formatDate:formatDate, convertBalance:convertBalance, isMe: isMe });

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


