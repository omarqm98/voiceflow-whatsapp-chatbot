exports.cleanVoiceflowMessageForWhatsapp = function (message) {
	// 1. Convertir enlaces de Voiceflow [texto](url) a formato WhatsApp "texto: url"
	message = message.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1: $2');
	
	// 2. Convertir negrita de doble asterisco a simple para WhatsApp
	message = message.replace(/\*\*([^*]+)\*\*/g, '*$1*');
	
	// 3. Eliminar completamente los caracteres de título (#) manteniendo el texto
	message = message.replace(/#{1,5}\s+/g, '');  // Elimina entre 1 y 5 # seguidos de espacio
	
	// 4. Limpiar espacios adicionales dentro de formato de negrita con un solo asterisco
	//message = message.replace(/\*\s+([^*]+)\s+\*/g, '*$1*');
	
	// 5. Eliminar markdown de listas si no es compatible con WhatsApp
	//message = message.replace(/\n\s*-\s+/g, '\n• ');  // Convertir guiones a bullets
	
	// 6. Eliminar caracteres de escape de markdown (\)
	//message = message.replace(/\\([*_~`])/g, '$1');
	
	return message;
}

exports.choiceToInteractiveButtons = function (choice) {
	const interactiveButtons = [];

	choice.payload.buttons.forEach (button => {
		let interactiveButton = {
			type: "reply",
			reply: {}
		};

		interactiveButton.reply.id = button.request.type;
		interactiveButton.reply.title = button.request.payload.label;
		
		interactiveButtons.push (interactiveButton);
	});

	return interactiveButtons;
}