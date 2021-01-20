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
  document.querySelector('#mailbox-view').style.display = 'block';
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
    //Create a row wrapper for all emails
    const wrapper = document.createElement('div');
    wrapper.id = 'wrapper';
    wrapper.className = 'row';
    document.querySelector('#mailbox-view').append(wrapper);
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
        col_recipient.className = 'col-md-4 d-flex align-items-center'
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
        col_sender.className = 'col-md-4 d-flex align-items-center'
        col_sender.innerHTML = emails[i].sender;
        mail_div.append(col_sender);
      }

      //Create subcolums for subject and timestamp
      const col_subject = document.createElement('div');
      col_subject.className = 'col-md-4 d-flex align-items-center'
      col_subject.innerHTML = emails[i].subject;
      mail_div.append(col_subject);

      const col_timestamp = document.createElement('div');
      col_timestamp.className = 'col-md-4 d-flex align-items-center justify-content-end'
      col_timestamp.innerHTML = emails[i].timestamp;
      mail_div.append(col_timestamp)
      
      //Append div to parent div
      document.querySelector('#wrapper').append(mail_div);
    }
  })
  // Then, listen for a click on each email col
  .then( () => {
    document.querySelectorAll('.mail-div').forEach(div => {
      div.onclick = () => {
        load_email(div.dataset.id)
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
  document.querySelector('#email-view').style.display = 'block';

  //Fetch from API
  fetch(`/emails/${id}`)
  //Then, get the response and convert it to jason
  .then(response => response.json())
  //Then, build html with data
  .then(email => {
    console.log(email);
    document.querySelector('#email-title').innerHTML = `<h3>${email.subject}</h3>`;
    document.querySelector('#email-sender').innerHTML = `From: ${email.recipients}`;
    document.querySelector('#email-recipients').innerHTML = `To: ${email.recipients}`;
    document.querySelector('#email-timestamp').innerHTML = email.timestamp;
    document.querySelector('#email-body').innerHTML = email.body;
    archive_btn = document.querySelector('#archive-btn');
    read_btn = document.querySelector('#read-btn');
    const user = JSON.parse(document.getElementById('user').textContent);
    if (user != email.sender) {
      if (email.read) {
        read_btn.innerHTML = 'Mark as Unread';
        read_btn.value = 'Mark as Unread';
      }
      else {
        read_btn.innerHTML = 'Mark as Read';
        read_btn.value = 'Mark as Read';
      }
      if (email.archived) {
        console.log(`email is currently archived`);
        archive_btn.innerHTML = 'Unarchive';
        archive_btn.value = 'Unarchive';
      }
      else {
        console.log(`email is currently unarchived`);
        archive_btn.innerHTML = 'Archive';
        archive_btn.value = 'Archive';
      }
    }
    else {
      read_btn.style.display='none'
      archive_btn.style.display='none'
    }
  })
  // Then, listen for a click on each button
  .then( () => {
    document.querySelectorAll('.opt-btn').forEach(button => {
      button.onclick = () => {
        markEmail(id, button.value);
        load_email(id)
      }
    })
  })
}

function markEmail(id, opt){
  console.log(`Fuction passed with values for id = ${id}, opt = ${opt}`)
  switch (opt) {
    case 'Mark as Unread':
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: false
        })
      })
      break;
    case 'Mark as Read':
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
      break;
    case 'Unarchive':
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      break;
    case 'Archive':
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      break;
  }
}
