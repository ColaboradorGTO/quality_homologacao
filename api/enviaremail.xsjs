//var jsPDF = $.import("quality.concentrador_homologacao.api.jspdf", "js"); 
//var jsPDF = $.import("quality.concentrador_homologacao.api.jspdf", "moment").moment;
$.import("quality.concentrador_homologacao.api.jspdf", "jspdf");
var jsPDF = $.quality.concentrador_homologacao.api.jspdf.jspdf;
function demo1() {
            var doc = new jsPDF()
            doc.addPage();
            doc.text(20, 20, 'Hello world!');
            doc.text(20, 30, 'This is client-side Javascript, pumping out a PDF.');
 
            // Making Data URI
            var out = doc.output();
            var url = 'data:application/pdf;base64,' + btoa(out);
            return url;
}
try {
      	var subscribers = ["juliano.linhares@gmail.com"];
    
        var smtpConnection = new $.net.SMTPConnection();
        
        // Create an attachment $.net.Mail.Part from JSObject.
    var secondPart = new $.net.Mail.Part({
        type: $.net.Mail.Part.TYPE_ATTACHMENT,
        data: demo1(), // data2 contains the binary data of the image
        contentType: "application/pdf",
        fileName: "pdf-lib_add_attachments.pdf"
        
    });
        
        var mail = new $.net.Mail({ sender: "informatica.tesoura@gmail.com",
            subject: "teste envio email xsjs",
            subjectEncoding: "UTF-8",
            parts: [new $.net.Mail.Part({
                        type: $.net.Mail.Part.TYPE_TEXT,
                        contentType: "text/html",
                        encoding: "UTF-8"
                   })]
            });
        
        for (var i = 0; i < subscribers.length; ++i) {
             mail.to = subscribers[i];
             //mail.parts[0].text = "Dear " + subscribers[i].split("@")[0] + ", you have been promoted to expert developer. Congratulations!";
             mail.parts[0].text = "<html><body><h1> Teste HTML</h1></body></html>";
             mail.parts.push(secondPart);
             var returnValue = smtpConnection.send(mail);
             
             //var returnValue = mail.send();
            var response = "MessageId = " + returnValue.messageId + ", final reply = " + returnValue.finalReply;
        
            $.response.setBody(JSON.stringify(response));
        }
         
        smtpConnection.close();
    }  
    catch (e) {  
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message : e.toString() }));
        $.response.status = 400;
    }  



