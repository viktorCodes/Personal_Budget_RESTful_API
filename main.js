// TODO
// * Create transaction log front end
// * Warning message for budgets exceeding income
// * Input sanitzing for budget categories
// * Zero balance bug

/* GLOBAL VARIABLES */
let selectedEnvelope;
const url = `http://localhost:3000/`;
let totalBills = 0;

//Function for adding commas to numbers
const commify = (input) => {
    if (typeof input === 'number') input = input.toString();
    if (input.length > 3) {
        input = input.split('').reverse();
        for (let i=0; i<input.length; i+=3) {
            input.splice(i, 0, ',');
        }
        input=input.reverse().join('');
    }
    return input;
}

/* API FETCH REQUESTS */
//  GET all
const getAll = async() => {
    $('.envelope-selection-area').empty();
    await fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        for (key in data) {
            let keyUp = key.charAt(0).toUpperCase() + key.slice(1);
            console.log(key, data[key])
            //   ADD ENVELOPES TO ENVELOPE SELECTION AREA
            if (data[key]%1) data[key] = data[key].toFixed(2);
            let enevelopeStr = '<div class="sample-envelope" id="'+key+'" onclick="clickEnvelope(\''+key+'\')">'
            +keyUp
            +'<h5 class="preview-balance"> $'
            +data[key]
            +'</h5></div>';
            $('.envelope-selection-area').append(enevelopeStr)
        };
        totalBills = Object.values(data).reduce((a,b)=>a+b);
        console.log('```````````````````` ' + totalBills)
        if (totalBills%1) totalBills = totalBills.toFixed(2);
        $('.total-bills').html(' ' + '<h2>' + '$'+totalBills + '</h2');
        console.log('total: ' + totalBills);
        let $overBudget = $('.over-budget');
        if (income < totalBills) {
            console.log('YOU BROKE!');
            $overBudget.addClass('active');
        } else if (income >= totalBills && $overBudget.hasClass('active')) {
            $overBudget.removeClass('active');
        }
    })
    .catch(err=>{
        console.error('Something went wrong getting the information!');
        console.error(err)
    })
}
// GET individual envelope
const findBal = (category) => {
    fetch(url).then(res=>res.json()).then(data=>{
            $('.live-balance').text('$'+data[category]);
        })
        .catch(err=>{
            console.error('Something went wrong getting the information!');
            console.error(err)
        })
}
// POST new envelope
const create = async() => {
    let $name = $('#envelope-name').val();
    // Do not submit without name or balance
    if (!$name || !$('#starting-balance').val().match(/\d/)) {
        return
    } else {
        let $bal = Number($('#starting-balance').val().split('$').join(''));
        let data = {};
        data['envelope']=$name.trim();
        data['amount']=$bal;
        console.log(data);
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const content = await response.json();
        // Clear the input fields after submitting
        $('input#envelope-name').val('')
        $('input#starting-balance').val('')
        // Clear existing envelopes and repopulate with the new one;
        getAll();
        return content;
    }
}
// PUT credit envelope
const credit = async() => {
    let amount = Number($('#credit-amount').val().split('$').join(''))
    await fetch(url+selectedEnvelope+'/credit/?amount='+amount, {
        method: 'PUT',
    })
    .then(res => res.json())
    .then(res => console.log(res))
    $('#credit-amount').val('');
    findBal(selectedEnvelope);
    getAll();
}
// PUT debit envelope
const debit = async() => {
    let amount = Number($('#debit-amount').val().split('$').join(''))
    await fetch(url+selectedEnvelope+'/debit/?amount='+amount, {
        method: 'PUT',
    })
    .then(res => res.json())
    .then(res => console.log(res))
    $('#debit-amount').val('');
    findBal(selectedEnvelope);
    getAll();
}
// POST transfer between envelopes
const transfer = async() => {
    let amount = Number($('#transfer-amount').val().split('$').join(''))
    let $from = $('#from-dropbtn').text();
    let $to = $('#to-dropbtn').text();
    await fetch(url+'transfer/'+$from+'/'+$to+'/?amount='+amount, {
        method: 'POST',
    })
    .then(res => res.json())
    .then(res => console.log(res))
    $('#transfer-amount').val('');
    findBal(selectedEnvelope);
    getAll();
}
// DELETE envelope
const deleteEnvelope = async() => {
    await fetch(url+selectedEnvelope, {
        method: 'DELETE',
    })
    .then(res => res.text())
    .then(res => console.log(res))
    $('.operations').removeClass('active');
    getAll();
}
/* END -- API FETCH REQUESTS */

/* INPUT VALIDATION */
// Function for adding "$" at beginning of number input when clicking on field
const $moneys = $('.money');
$('.money').on('focus', function(){
    if ($(this).val()==='') $(this).val('$');
    // $(this).val('$');
})
// Function for removing "$" from beginning of number when clicking off of field
$('.money').on('blur', function(){
    if ($(this).val()==='$') $(this).val('');
    console.log('blur: '+ totalBills)
    // totalBills = Object.values(data).reduce((a,b)=>a+b);
    let income = Number($('#income-input').val().substring(1));
    let $overBudget = $('.over-budget');
    if (income < totalBills) {
        console.log('YOU BROKE!');
        $overBudget.addClass('active');
    } else if (income >= totalBills && $overBudget.hasClass('active')) {
        $overBudget.removeClass('active');
    }
})
// Allowing only numbers and decimal point as input
function isNumberKey(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode === 46 && $input.val().includes('.')) return false;
    if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
}
/* END -- INPUT VALIDATION */

/* GUI FUNCTIONS */
const clickEnvelope = category => {
    selectedEnvelope = category;
    // JQuery variables;
    let $ops = $('.operations');
    let $header = $('#ops-header-category');
    let $balView = $('.ops-balance-view');
    let $liveBal = $('.live-balance');
    let $credit = $('input#credit-amount');
    let $debit = $('input#debit-amount');
    let $transfer = $('#transfer-amount');
    // Reset the button click state;
    $('li.action').each(function(){$(this).removeClass('active')})
    $('.action-state').each(function(){$(this).removeClass('active')})
    // Reset the input fields
    $credit.val('');
    $debit.val('');
    $transfer.val('');
    // Opening the operations section if it's closed;
    if (!$ops.hasClass('active')) $ops.addClass('active')
    // Closing the operations section if the same button is clicked...
    // and switching between envelopes in the operations section;
    else if ($ops.hasClass('active') && $header.text() === category) {
        $ops.removeClass('active');
    } 
    // Giving the operations section a header of the catagory itself;
    $header.text(category)
    // category=category.toLowerCase();
    $balView.append('<span class="live-balance">$</span>')
    findBal(category);

    //* Sample envelope balances - comment this out when API is live
    // if (category==='rent') $balView.append('<span class="live-balance">$1000</span>');
    // else if (category==='cable') $balView.append('<span class="live-balance">$80</span>');
    // else if (category==='phone') $balView.append('<span class="live-balance">$55</span>');
    // else if (category==='electric') $balView.append('<span class="live-balance">$60</span>');
    // This prevents multiple spans from being added somehow;
    $liveBal.remove()
}
/* END -- GUI FUNCTIONS */

/* MODE RADIO BUTTON FUNCTION */
const modeSelect = mode => {
    $('.action-state').each(function(){$(this).removeClass('active')})
    $('li.action').each(function(){$(this).removeClass('active')})
    if (mode==='credit'){
        $('.action-state#credit').addClass('active');
        $('#credit-btn').addClass('active');
    }
    else if (mode==='debit'){
        $('.action-state#debit').addClass('active');
        $('#debit-btn').addClass('active');
    }
    else if (mode==='transfer'){
        $('.action-state#transfer').addClass('active');
        $('#transfer-btn').addClass('active');
        menuPopulate();
    }
    else if (mode==='delete'){
        $('.action-state#delete').addClass('active');
        $('#delete-btn').addClass('active');
    }
}

/* DROPDOWN CATEGORIES */
function menuPopulate(){
    $('#from-dropdown').empty();
    $('#to-dropdown').empty();
    $('.sample-envelope').each(function(){
        let cat = $(this).attr('id'); 
        let inputStrFrom = '<a onclick="accountSelect(\''+cat+'\', \'from\')">' + cat + '</a>';
        let inputStrTo = '<a onclick="accountSelect(\''+cat+'\', \'to\')">' + cat + '</a>';
        $('#from-dropdown').append(inputStrFrom);
        $('#to-dropdown').append(inputStrTo);
    });
}

const accountSelect = (account, direction) => {
    // console.log(account,direction)
    if (direction==='to') {
        $('#to-dropbtn').html(account);
        $('#to-dropbtn').css("background-color", "whitesmoke")
        $('#to-dropbtn').css("color", "black")
        $('#to-dropbtn').css("border", "3px solid black")
        $('#to-dropbtn').css("font-weight", "700")
    }
    else if (direction==='from') {
        $('#from-dropbtn').html(account);
        $('#from-dropbtn').css("background-color", "whitesmoke")
        $('#from-dropbtn').css("color", "black")
        $('#from-dropbtn').css("border", "3px solid black")
        $('#from-dropbtn').css("font-weight", "700")
    }
}
/* END --DROPDOWN CATEGORIES */

/* EVENT LISTENERS */
// For pressing enter when transacting
$('#starting-balance').on("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        $('button#create').click();
    }
});
$('#envelope-name').on("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        $('button#create').click();
    }
});
$('#credit-amount').on("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        $('button#credit-submit').click();
    }
});  
$('#debit-amount').on("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        $('button#debit-submit').click();
    }
});  
$('#transfer-amount').on("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        $('button#transfer-submit').click();
    }
});
$('#income-input').on('keyup', function(event) {
    let income = $(this).val();
    if (income[0]==='$') income = income.substring(1);
    income = Number(income);
    console.log('income: ' + income, typeof income)
    if ($(this).val()==='') $(this).val('$')
}) 
/* END -- EVENT LISTENERS */

/* FUNCTION CALLS */
getAll() // for populating envelopes upon entering site
/* END -- FUNCTION CALLS */