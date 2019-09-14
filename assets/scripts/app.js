

$(document).ready(function() {

    // Logout 
    $('body').on('click', '[data-action="logout"]', function(e){
        e.preventDefault();
        Cookies.remove('Auth');
        $('#wrapper').html(tmpl.login.render())
    })

    // Register
    $('body').on('click', '[data-action="register"]', function(e){
        e.preventDefault();
        $('#wrapper').html(tmpl.register.render())
    }) 

    // Login
    $('body').on('click', '[data-action="login"]', function(e){
        e.preventDefault();
        $('#wrapper').html(tmpl.login.render())
    })        

    // Buy tokens start 
    $('body').on('keyup', '[name="tokensAmount"]', function(e){
        e.preventDefault();
        var tokensAmount = $(this).val();
        $('[name="amountRuble"]').val(Number(tokensAmount*UserData.tokenPrice).toFixed(0))
    })        

    $('body').on('keyup', '[name="amountRuble"]', function(e){
        e.preventDefault();
        var amountRuble = $(this).val();
        $('[name="tokensAmount"]').val(Number(amountRuble/UserData.tokenPrice).toFixed(0))
    })        

    $('body').on('click','#buyCoin .btn-success', function(e){
        e.preventDefault();
        var amountRuble = $('[name="amountRuble"]').val();
        getAjaxData('/payments',{input:{amount:amountRuble, url:originUrl }}, function(response){
            if( response.status == 'success' ){
                window.location.replace(response.redirectUrl)
            }else(
                alert(response.textErr)
            )
        },'POST','createPayment')
    })
    // buy tokens end


    var successPayment = windowHref.searchParams.get("successPayment");
    if(successPayment){
        getAjaxData('/payments/success',{input:{uuid:successPayment}}, function(response){
            if( response.status == 'success' ){
                $('#wrapper').html(tmpl.dashboard.render())  
            }else(
                alert(response.textErr)
            )
        },'POST','createPayment')        
    }


    // Search users
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

    // all forms
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


    // delete user
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
