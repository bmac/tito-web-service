var extend = require('extend');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Mailgun", // sets automatically host, port and connection security settings
  auth: {
    user: "postmaster@sandbox51844.mailgun.org",
    pass: "8bof26ayssg9"
  }
});


var mailOptions = {
  from: 'Mailgun Sandbox <postmaster@sandbox51844.mailgun.org>',
  to: '',
  html: 'Attached is are two documents for your records.',
  subject: 'Thankyou for signup up for our SOG Test Event',
  attachments: [
    {
      filePath: 'assets/pdf/terms-of-use.pdf'
    },
    {
      filePath: 'assets/pdf/privacy-policy.pdf'
    }
  ]
};

/**
 * TicketController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  webhook: function(req, res, next) {
    var hasEmail;
    if (req.method.toUpperCase() !== 'POST') {
      return next();
    }
    console.log(req.get('X-Webhook-Name'));
    if ('ticket.updated' === req.get('X-Webhook-Name')) {
      Ticket.findOne({reference: req.body.reference}).then(function(ticket) {
        hasEmail = !!ticket.email;
        extend(ticket, req.body);
        res.status(200);
        return ticket.save();
      }).then(function() {
        if (!hasEmail && req.body.email) {
          mailOptions.to = req.param('email');
          smtpTransport.sendMail(mailOptions, next);
        } else {
          next();
        }
      }, next);
    } else {
    var ticketInfo = extend({}, req.body, {'X-Webhook-Name': req.get('X-Webhook-Name')});
    Ticket.create(ticketInfo).then(function() {
      res.status(201);
      next();
    }, next);
  }
};
