document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'flex';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailbox-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Inbox functionality
  //Fetch from API
  fetch(`/emails/${mailbox}`)
  //Then, get the response and convert it to jason
  .then(response => response.json())
  //Then, build html with data
  .then(emails => {
    // Traverse the json object gotten from the response
    for (i = 0; i < emails.length; i++) {
      //For each email create a col div
      const mail_div = document.createElement('div');
      mail_div.dataset.id = emails[i].id;
      if (mailbox == 'sent'){
        // Set a class to the col
        mail_div.className = 'mail-div col-12 unread d-flex align-items-center'
        //Create subcolum for recipient
        const col_recipient = document.createElement('div');
        col_recipient.className = 'col-md-3'
        col_recipient.innerHTML = `To : ${emails[i].recipients}`;
        mail_div.append(col_recipient);
      }
      else{
        // Set a class to the col
        if (emails[i].read) {
          mail_div.className = 'mail-div col-12 read d-flex align-items-center'
        }
        else {
          mail_div.className = 'mail-div col-12 unread d-flex align-items-center'
        }
        //Create subcolumn for sender
        const col_sender = document.createElement('div');
        col_sender.className = 'col-md-3'
        col_sender.innerHTML = emails[i].sender;
        mail_div.append(col_sender);
      }

      //Create subcolums for subject and timestamp
      const col_subject = document.createElement('div');
      col_subject.className = 'col-md-6 col-subject'
      col_subject.innerHTML = emails[i].subject;
      mail_div.append(col_subject);

      const col_timestamp = document.createElement('div');
      col_timestamp.className = 'col-md-3 d-flex justify-content-end'
      col_timestamp.innerHTML = emails[i].timestamp;
      mail_div.append(col_timestamp)
      
      //Append div to parent div
      document.querySelector('#mailbox-view').append(mail_div);
    }
  })
  // Then, listen for a click on each email col
  .then( () => {
    document.querySelectorAll('.mail-div').forEach(div => {
      div.onclick = () => {
        // Mark the email as read
        fetch(`/emails/${div.dataset.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        // Then, get the response and log it
        .then (response => {
          console.log(response)
        })
        // Then, load the email html
        .then (() =>  load_email(div.dataset.id))
      }
    })
  })
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Listen for form submission
  document.querySelector('#compose-form').onsubmit = function (){
    // Get field values from the form
    const recipients = document.querySelector('#compose-recipients').value;
    const subject =  document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Send POST request to server
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });
    // Load inbox again
    load_mailbox('inbox');
    // Stop form from submitting
    return false;
  }
}

function load_email(id){
  console.log(`Loading email with id ${id}`)
  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'flex';

  //Fetch from API
  fetch(`/emails/${id}`)
  //Then, get the response and convert it to jason
  .then(response => response.json())
  //Then, build html with data
  .then(data => {
    //Log the data to console and store it in a variable for use of the parent function
    console.log(data);
    email = data;
    //Build the html
    document.querySelector('#email-title').innerHTML = `<h4>${email.subject}</h4>`;
    document.querySelector('#email-sender').innerHTML = `From: ${email.sender}`;
    document.querySelector('#email-recipients').innerHTML = `To: ${email.recipients}`;
    document.querySelector('#email-timestamp').innerHTML = email.timestamp;
    document.querySelector('#email-body').innerHTML = email.body;
    //Get the buttons elements
    archive_btn = document.querySelector('#archive-btn');
    read_btn = document.querySelector('#read-btn');
    reply_btn = document.querySelector('#reply-btn');
    //Get who the user is
    const user = JSON.parse(document.getElementById('user').textContent);
    //Show the buttons if user is the sender
    if (user != email.sender) {
      if (email.read) {
        read_btn.value = 'Mark as Unread';
      }
      else {
        read_btn.value = 'Mark as Read';
      }
      if (email.archived) {
        archive_btn.value = 'Unarchive';
      }
      else {
        archive_btn.value = 'Archive';
      }
      read_btn.innerHTML = read_btn.value;
      archive_btn.innerHTML =  archive_btn.value;
    }
    else {
      read_btn.style.display='none'
      archive_btn.style.display='none'
      reply_btn.style.display='none'
    }
  })
  // Then, listen for a click on each button
  .then( () => {
    //Event listener for the archive or markasread button
    document.querySelectorAll('.opt-btn').forEach(button => {
      button.onclick = () => {
        //Mark the email
        markEmail(id, button);
      }
    })
    //Event listener for the reply button
    document.querySelector('#reply-btn').onclick = () => {
      //Call function to show email composition form
      compose_email()
      // Prefill composition fields
      document.querySelector('#compose-recipients').value = email.sender;
      if (email.subject.substring(0,3) == 'Re:'){
        document.querySelector('#compose-subject').value = email.subject
      }
      else{
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`
      }
      document.querySelector('#compose-body').value = 
      `
       \t----------------------------------------------------
       \tOn ${email.timestamp} ${email.sender} wrote:
       \t${email.body}`;
    }

  })
}

function markEmail(id, button){
  //Get the setting that is being modified
  let setting
  switch (button.value) {
    case 'Mark as Unread':
        setting = JSON.stringify({
            read: false
            })
      break;
    case 'Mark as Read':
        setting = JSON.stringify({
            read: true
            })
      break;
    case 'Unarchive':
        setting = JSON.stringify({
            archived: false
            })
      break;
    case 'Archive':
        setting = JSON.stringify({
            archived: true
            })
      break;
  }
  //Fetch server with PUT request passing the setting as body
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: setting,
  })
  //Then, get the response and log it to console
  .then (response => {
    console.log(response)
  })
  //Then, load the user's mailbox once again
  .then ( () => load_mailbox('inbox') )
}