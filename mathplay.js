////////// Shared code (client and server) //////////

Questions = new Meteor.Collection('questions');
// { order_number: 1, text: "61 + 63 = ?", answer: 123 }

//var current_question_id = 0;
var current_order_number = 0;

Meteor.methods({
	
	getLastQuestion: function () {
		return Questions.findOne({}, { sort: {order_number: -1} });
	},
	
	getNewQuestion: function () {
		var nr1 = Math.round(Math.random() * 100);
		var nr2 = Math.round(Math.random() * 100);
		question_string = nr1 + " + " + nr2 + " = ?";
		question_answer = (nr1 + nr2);
		current_order_number = Questions.find({}).count() + 1;
		current_question_id = Questions.insert({ order_number: current_order_number, text: question_string, answer: question_answer });
		return Questions.findOne({_id: current_question_id});//current_question_id;
	},

	removeAllQuestions: function () {
		current_order_number = 0;
		Questions.remove({});
	}

});


////////// CLIENT //////////

if (Meteor.is_client) {
	
	// client: subscribe to all rooms, and messages in the first room
	Meteor.subscribe("questions");	

	Template.current_question.order_number = function () {
		question = Questions.findOne({}, { sort: {order_number: -1} });
		return (question ? question.order_number : '#');
	};

	Template.current_question.questiontext = function () {
		question = Questions.findOne({}, { sort: {order_number: -1} });
		return (question ? question.text : '---');
	};

	Template.question_history.questions = function () {
		return Questions.find({}, { sort: {order_number: -1} });
	};

	Template.question_history.events = {
		'click button#deleteallbutton': function () {
			console.log('Delete All: ' + Questions.find({}).count());
			Meteor.call('removeAllQuestions', function (error, result) {
				if (error)
					console.log(error);
			});
			callGetNewQuestion();
		}
	};
		
	Template.name_input.events = {
		'click button#setnamebutton': function () {
			Session.set("player_name", document.getElementById('nametextbox').value);
			document.getElementById('nametextbox').disabled = true;
			document.getElementById('setnamebutton').disabled = true;
		}
	};
	
	Template.number_input.events = {};
	Template.number_input.events[okcancel_events('#answertextbox')] = make_okcancel_handler({
		ok: function (text, event) {
			console.log("current_order_number: " + Session.get("current_question_order_number"));
			question = Questions.findOne({ order_number: Session.get("current_question_order_number") });
			console.log("question: " + question.text);
			if (question.answer == document.getElementById('answertextbox').value) {
				console.log('True');
				Questions.update(question._id, {$set: {text: question.text.substr(0, question.text.length - 1) + question.answer, player: Session.get("player_name")}});
				callGetNewQuestion();
			}
			else {
				console.log('False');
			}
			document.getElementById('answertextbox').value = "";
			document.getElementById('answertextbox').focus();
		}
	});

	// Get all Properties for an object:
	var logAttributes = function (obj) {
		var strtemp = "";
		for(var key in obj) {
			strtemp += key + ": " + obj[key] + ", ";
		}
		console.log(strtemp); // OR: throw(strtemp);
	}
	
	var processQuestionResults = function (error, result) {
		if (!error) {
			Session.set("current_question_text", result.text);
			Session.set("current_question_order_number", result.order_number);
			//logAttributes(result);
		}
		else {
			console.log(error);
		}
	};

	var callGetNewQuestion = function () {
		console.log('callGetNewQuestion!');
		Meteor.call('getNewQuestion', processQuestionResults);
	};


	Meteor.startup(function () {
		Session.set("current_question_order_number", "#");
		Session.set("current_question_text", "Not set yet");
		Meteor.call('getLastQuestion', processQuestionResults);
		document.getElementById('answertextbox').focus();
	});

}


////////// SERVER //////////

if (Meteor.is_server) {
	Meteor.startup(function () {
		// code to run on server at startup

	// publish questions
	//Meteor.publish("questions");
	Meteor.publish('questions', function (id) {
		return Questions.find({});
	});
	// Meteor.publish('questions', function (id) {
	//	 return Questions.find({_id: id});
	// });

	//new_question();
	});
}