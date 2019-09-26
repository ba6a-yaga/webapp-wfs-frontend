

$(document).ready(function() {

    $('body').on('click', '[data-action="dashboard"]', function(e){
        e.preventDefault();
        reloadDashboard()
       
    })

    
    $('body').on('click', '[data-toggle]', function(e){
        e.preventDefault();

        var id = $(this).attr('data-toggle');
        $("#"+id).toggle()
        
    })

    // profile


    $('body').on('click', '[data-action="profile"]', function(e){
        e.preventDefault();
        $('#wrapper').html(tmpl.profile.render())
    })


    $('body').on('click', '[data-action="createFriendLink"]', function(e){
        e.preventDefault();
        getAjaxData('/users/createFriendLink',{},function(response){

            if( response.status == 'success'){
                loadUserData()
                $("#friends").html(tmpl.friends.render())
            }else{
                alert(response.textErr)
            }

        },'POST','createFriendLink')
    })


    $('body').on('click', '[data-action="getprivatekey"]', function(e){
        e.preventDefault();
        password = prompt('Введите пароль');
        var clickLink = $(this)

        if(password == null)
            return false;
        
        getAjaxData('/users/current/getmnemonic',{input: {password: password}}, function(response){

            if( response.status == 'success' ){
                $('#mnemonic').val(response.mnemonic).show()
                clickLink.hide()
            }else{
                alert(response.textErr)
            }
        
                
        },'POST','/users/current/getmnemonic')
        
    })

    

    $('body').on('submit', '[data-action="updateProfile"]', function(e){
        e.preventDefault();
        var form = $(this);
        var data = getFormData(form)


        if(data.card.length){
            var isValidCard = $('[data-validate="card"]').validateCreditCard();
            if(!isValidCard.valid){
                form.find('.alert-danger').text('Неверный номер карты').show()
                return false;
            }
        }
        form.find('button[type="submit"]').attr("disabled", true);
        form.find('button[type="submit"] i').removeClass('d-none')

        getAjaxData(form.attr('action'),{input: data}, function(response){
            form.find('button[type="submit"]').attr("disabled", false);
            form.find('button[type="submit"] i').addClass('d-none')

            if( response.status == 'success' ){
                form.find('.alert-success').show()
                form.find('.alert-danger').hide()

                setTimeout(function(){
                    form.find('.alert-success').hide()
                },5000)    
                reloadDashboard()
            }else{
                form.find('.alert-danger').text(response.textErr).show()
            }
        
             
        },'PUT',form.attr('action'))

    })

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
        var parent = $(this).parents('form')
        $('[name="amountRuble"]',parent).val(Number(tokensAmount*UserData.tokenPrice).toFixed(2))
    })        

    $('body').on('keyup', '[name="amountRuble"]', function(e){
        e.preventDefault();
        var amountRuble = $(this).val();
        var parent = $(this).parents('form')
        $('[name="tokensAmount"]', parent).val(Number(amountRuble/UserData.tokenPrice).toFixed(2))
    })       
    

    $('body').on('click','#replenishBalance .btn-success', function(e){
        e.preventDefault();
        var parent = $(this).parents('#replenishBalance');
        var amountRuble = Number($('[name="amount"]',parent).val()).toFixed(2);
        var type = $('[name="type"]:checked',parent).val();
        $('button[type="submit"]', parent).attr("disabled", true);
        $('button[type="submit"] i', parent).removeClass('d-none')

        getAjaxData('/payments',{input:{amount:amountRuble, type:type, url:originUrl }}, function(response){
            $('button[type="submit"]', parent).attr("disabled", false);
            $('button[type="submit"] i', parent).addClass('d-none')

            if( response.status == 'success' ){
                if( type == 'card' ){
                    $('.alert-success', parent).show()
                    window.location.replace(response.redirectUrl)
                }else{
                    $('.alert-danger', parent).hide()
                    $('.alert-success', parent).show()
                    setTimeout(function(){
                        reloadDashboard()
                    },1000)                    
                }
            }else(

                $('.alert-danger', parent).text(response.textErr).show()
            )
        },'POST','createPayment')
    })
    // buy tokens end

    $('body').on('click','#withdraw .btn-success', function(e){
        e.preventDefault();

        var parent = $(this).parents('#withdraw')
        var amountRuble = Number($('[name="amount"]', parent).val()).toFixed();
        $('button[type="submit"]', parent).attr("disabled", true);
        $('button[type="submit"] i', parent).removeClass('d-none')

        getAjaxData('/withdrawal',{input:{amount:amountRuble}}, function(response){
            $('button[type="submit"]', parent).attr("disabled", false);
            $('button[type="submit"] i', parent).addClass('d-none')
            
            if( response.status == 'success' ){
                $('.alert-danger', parent).hide()
                $('.alert-success', parent).show()
                setTimeout(function(){
                    reloadDashboard()
                },1000)                      
            }else(
                $('.alert-danger', parent).text(response.textErr).show()
            )
        },'POST','withdrawal')
    })


    $('body').on('change', '[data-action="changeStatusWithdrawal"]', function(e){
        e.preventDefault();
        var status = $(this).val();
        var id = $(this).attr('data-id');
        var text = $(':selected',this).text()
        var el = $(this)

        if(confirm('Вы уверены что хотите изменить статус на '+text)){
            getAjaxData('/withdrawal',{input:{id:id,status:status}}, function(response){
                if( response.status == 'success' ){
                    el.replaceWith('<span class="label label-success">Выполнено</span>')
                }else(
                    alert(response.textErr)
                )
            },'PUT','withdrawal')                 
        }

    })

    var successPayment = windowHref.searchParams.get("successPayment");
    if(successPayment){
        getAjaxData('/payments/success',{input:{uuid:successPayment}}, function(response){
            if( response.status == 'success' ){
                reloadDashboard()
            }else(
                alert(response.textErr)
            )
        },'POST','createPayment')        
    }


    

    $('body').on('change','form [name="role"]',function(e){

        var parent = $(this).parents('form') 

        if( $(this).val() == 'admin'){
            $('.refPercent', parent).hide()
        }else{
            $('.refPercent', parent).show()
        }
    })

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


    $('body').on('submit', '[data-adduserdashboard="true"]', function(e){
        e.preventDefault();
        var form = $(this);
        var data = getFormData(form)
        form.find('button[type="submit"]').attr("disabled", true);
        form.find('button[type="submit"] i').removeClass('d-none')

        getAjaxData(form.attr('action'),{input: data}, function(response){
            form.find('button[type="submit"]').attr("disabled", false);
            form.find('button[type="submit"] i').addClass('d-none')

            if( response.status == 'success' ){
                form.find('.alert-success').show()
                form.find('.alert-danger').hide()
                form[0].reset()

                getAjaxData('/users/current',{},function(response){
                        window.UserData = response.user;
                        updateUserList()
                },'GET', 'Get current');

                setTimeout(function(){
                    form.find('.alert-success').hide()
                },5000)    
            }else{
                form.find('.alert-danger').text(response.textErr).show()
            }
        
             
        },'POST',form.attr('action'))

    });


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
                    $(this).val('')
                })
            }else{
                form.find('.alert-danger').text(response.textErr).show()
            }
        }

        var buyTokens = function(response){
            if( response.status == 'success' ){

                form.find('.alert-success').show()
                form.find('.alert-danger').hide()
                
                setTimeout(function(){
                    form.find('.alert-success').hide()
                    reloadDashboard()
                },5000)


                
            }else{
                form.find('.alert-danger').text(response.textErr).show()
            }           
        }

        var login = function(response){
            if( response.status == 'success' ){
                window.UserData = response.user;
                Cookies.set('Auth', response.user.token);
                window.location.replace(originUrl)  
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

            if( form.attr('action') == '/transactions/buyTokens' )
                buyTokens(response)
            
            if( form.attr('action') == '/users' )
                register(response)                
        },'POST',form.attr('action'))

        return false;
    })


    $('body').on('change','[data-refPercent]', function(e){
        var percent = $(':selected',this).val()
        var isUpdate = confirm("Вы точно изменить процент пользователя?");
        var userid = $(this).attr('data-refPercent');

        if( isUpdate )
            getAjaxData('/users/refPercent/'+userid,{input:{refPercent:percent}}, function(response){
                if(response.status == 'failed'){
                    alert(response.textErr)
                }
            },'PUT','Update refpercent user')
    })



    $('body').on('change','[data-friendsCount]', function(e){
        var percent = $(':selected',this).val()
        var isUpdate = confirm("Вы точно изменить кол-во приглашений пользователя?");
        var userid = $(this).attr('data-friendsCount');

        if( isUpdate )
            getAjaxData('/users/friendsCount/'+userid,{input:{friendsCount:percent}}, function(response){
                if(response.status == 'failed'){
                    alert(response.textErr)
                }
            },'PUT','Update friendsCount user')
    })    

    $('body').on('change','[data-paymentStatus]', function(e){
        var status = $(':selected',this).val()
        var isUpdate = confirm("Вы точно изменить статус платежа?");
        var paymentId = $(this).attr('data-paymentStatus');

        if( isUpdate )
            getAjaxData('/payments/changestatus/',{input:{id:paymentId, status:status}}, function(response){
                if(response.status == 'failed'){
                    alert(response.textErr)
                }
            },'POST','Update changestatus payment')
    })    

    // delete user
    $('body').on('click', '[data-rmuser]',function(e){
        e.preventDefault();
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

    // lock user
    $('body').on('click', '[data-lockuser]',function(e){
        e.preventDefault();
        var userid = $(this).attr('data-lockuser');
        var isLock = confirm("Вы уверены?");
        var link = $(this);
        if( isLock )
            getAjaxData('/users/lock/'+userid,{}, function(response){
                if(response.status == 'success'){
                    if( response.lock )
                        link.text('Разблокировать')
                    else
                        link.text('Заблокировать')

                }else{
                    alert(response.textErr)
                }
            },'PUT','delete user')
    })      

})
