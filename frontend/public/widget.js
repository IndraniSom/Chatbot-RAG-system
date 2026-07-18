(function() {
	//#region src/widget.ts
	(() => {
		/**
		* Find the script that loaded
		* the Scrappy widget.
		*/
		const script = document.querySelector("script[data-website-id]");
		if (!script) {
			console.error("[Scrappy] Could not find widget script.");
			return;
		}
		/**
		* Read configuration.
		*/
		const websiteId = script.dataset.websiteId;
		const apiUrl = script.dataset.apiUrl || (typeof window !== "undefined" ? window.location.origin : "") || "http://localhost:5000";
		if (!websiteId) {
			console.error("[Scrappy] data-website-id is required.");
			return;
		}
		/**
		* Create widget host.
		*/
		const host = document.createElement("div");
		host.id = "scrappy-chat-widget";
		document.body.appendChild(host);
		/**
		* Create Shadow DOM.
		*/
		const shadow = host.attachShadow({ mode: "open" });
		/**
		* Widget HTML.
		*/
		shadow.innerHTML = `
    <style>

      * {
        box-sizing: border-box;
      }

      .scrappy-button {
        position: fixed;

        right: 24px;
        bottom: 24px;

        width: 56px;
        height: 56px;

        border: none;
        border-radius: 50%;

        background: #111827;
        color: white;

        font-size: 24px;

        cursor: pointer;

        box-shadow:
          0 8px 24px
          rgba(0, 0, 0, 0.2);
      }

      .scrappy-window {
        position: fixed;

        right: 24px;
        bottom: 92px;

        width: 360px;
        height: 500px;

        background: white;

        border-radius: 16px;

        box-shadow:
          0 20px 50px
          rgba(0, 0, 0, 0.2);

        display: none;

        flex-direction: column;

        overflow: hidden;

        font-family:
          Arial,
          sans-serif;
      }

      .scrappy-window.open {
        display: flex;
      }

      .scrappy-header {
        padding: 16px;

        background: #111827;
        color: white;

        font-weight: 600;
      }

      .scrappy-messages {
        flex: 1;

        padding: 16px;

        overflow-y: auto;

        background: #f9fafb;
      }

      .message {
        margin-bottom: 12px;

        padding: 10px 12px;

        border-radius: 10px;

        max-width: 85%;

        line-height: 1.4;

        font-size: 14px;
      }

      .user {
        margin-left: auto;

        background: #111827;
        color: white;
      }

      .assistant {
        background: white;

        border:
          1px solid #e5e7eb;
      }

      .scrappy-input-area {
        display: flex;

        padding: 12px;

        border-top:
          1px solid #e5e7eb;

        background: white;
      }

      .scrappy-input {
        flex: 1;

        padding: 10px;

        border:
          1px solid #d1d5db;

        border-radius: 8px;

        outline: none;
      }

      .scrappy-send {
        margin-left: 8px;

        padding:
          10px 16px;

        border: none;

        border-radius: 8px;

        background: #111827;
        color: white;

        cursor: pointer;
      }

    </style>


    <button
      class="scrappy-button"
      aria-label="Open chatbot"
    >
      💬
    </button>


    <div
      class="scrappy-window"
    >

      <div
        class="scrappy-header"
      >
        Scrappy AI
      </div>


      <div
        class="scrappy-messages"
      >

        <div
          class="message assistant"
        >
          Hi! How can I help you?
        </div>

      </div>


      <div
        class="scrappy-input-area"
      >

        <input
          class="scrappy-input"
          placeholder="Ask a question..."
        />

        <button
          class="scrappy-send"
        >
          Send
        </button>

      </div>

    </div>
  `;
		/**
		* Get widget elements.
		*/
		const button = shadow.querySelector(".scrappy-button");
		const chatWindow = shadow.querySelector(".scrappy-window");
		const messages = shadow.querySelector(".scrappy-messages");
		const input = shadow.querySelector(".scrappy-input");
		const sendButton = shadow.querySelector(".scrappy-send");
		/**
		* Open / close chatbot.
		*/
		button.addEventListener("click", () => {
			chatWindow.classList.toggle("open");
		});
		/**
		* Add message to UI.
		*/
		function addMessage(text, type) {
			const message = document.createElement("div");
			message.className = `message ${type}`;
			message.textContent = text;
			messages.appendChild(message);
			messages.scrollTop = messages.scrollHeight;
		}
		/**
		* Send message to Scrappy API.
		*/
		async function sendMessage() {
			const message = input.value.trim();
			if (!message) return;
			/**
			* Display user message.
			*/
			addMessage(message, "user");
			input.value = "";
			sendButton.disabled = true;
			try {
				var _result$data;
				const response = await fetch(`${apiUrl}/api/chat`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						websiteId,
						message
					})
				});
				if (!response.ok) throw new Error("Chat request failed");
				const result = await response.json();
				const answer = result === null || result === void 0 || (_result$data = result.data) === null || _result$data === void 0 ? void 0 : _result$data.answer;
				if (!answer) throw new Error("Invalid chatbot response");
				addMessage(answer, "assistant");
			} catch (error) {
				console.error("[Scrappy]", error);
				addMessage("Sorry, I couldn't answer that right now.", "assistant");
			} finally {
				sendButton.disabled = false;
				input.focus();
			}
		}
		/**
		* Send button.
		*/
		sendButton.addEventListener("click", sendMessage);
		/**
		* Press Enter to send.
		*/
		input.addEventListener("keydown", (event) => {
			if (event.key === "Enter") sendMessage();
		});
		console.log(`[Scrappy] Widget loaded for ${websiteId}`);
	})();
	//#endregion
})();
