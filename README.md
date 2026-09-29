# <img src='Workflow/icon.png' width='45' align='center' alt='icon'> Alfred AI Workflow

Chat with OpenAI, DeepSeek, or another OpenAI-compatible API; generate images with OpenAI.

Forked from [alfredapp/openai-workflow](https://github.com/alfredapp/openai-workflow). The [Alfred Gallery listing](https://alfred.app/workflows/alfredapp/openai) installs the original OpenAI-only workflow, not this fork.

## Install

This fork is not published in the Alfred Gallery. On macOS, clone the repository and package the `Workflow` directory, then double-click the resulting `.alfredworkflow` file:

```sh
git clone https://github.com/zouri/alfred-ai-workflow.git
cd alfred-ai-workflow/Workflow
zip -r ../alfred-ai-workflow.alfredworkflow .
open ../alfred-ai-workflow.alfredworkflow
```

Alfred 5 with Powerpack is required. This fork has its own Bundle ID, so it can coexist with the original workflow; Alfred stores its configuration and chat history separately. If both are enabled, change the **Chat Keyword** in one workflow to avoid a `chatgpt` keyword conflict.

## Setup

In the [Workflow Configuration](https://www.alfredapp.com/help/workflows/user-configuration/), choose a **Chat Provider**:

* **OpenAI** (default): Set an [OpenAI API key](https://platform.openai.com/api-keys) and choose an **OpenAI Model**.
* **DeepSeek**: Set a [DeepSeek API key](https://platform.deepseek.com/api_keys) in **Chat API Key**. The default chat model is `deepseek-flash`; use **Chat Model** to override it.
* **OpenRouter, Qwen (Alibaba Cloud), Moonshot (Kimi), SiliconFlow, xAI, Mistral, Perplexity Router, Zhipu GLM, or Volcengine Ark (Doubao)**: Set that provider's key in **Chat API Key** and its model ID in **Chat Model**. The workflow supplies the provider's Chat Completions endpoint.
* **Other OpenAI-compatible API**: Set **Chat API Key**, **Chat API Endpoint**, and **Chat Model**. The endpoint can be an HTTPS base URL (such as `https://api.example.com/v1`) or a full `/chat/completions` URL. The provider must support streamed Chat Completions responses.

DALL·E always uses the OpenAI API key, regardless of the chat provider. The OpenAI organization ID is likewise only sent to OpenAI. Existing OpenAI settings and the `chatgpt` keyword continue to work. The non-OpenAI providers share one **Chat API Key** field, so update it when switching providers. Qwen and Volcengine Ark use their Beijing endpoints; use **Other** to specify a different region or workspace URL. Perplexity Router requires a [Router model ID](https://docs.perplexity.ai/docs/getting-started/quickstart), not a Sonar model ID.

These presets are a subset of the [new-api channel list](https://github.com/QuantumNous/new-api/blob/main/constant/channel.go), restricted to HTTPS Chat Completions endpoints with Bearer-key authentication. Providers using a different request protocol or authentication scheme are not included.

## Usage

### Chat

Query your selected chat provider via the `chatgpt` keyword (customizable in Workflow Configuration), the [Universal Action](https://www.alfredapp.com/help/features/universal-actions/), or the [Fallback Search](https://www.alfredapp.com/help/features/default-results/fallback-searches/).

![Start ChatGPT query](Workflow/images/about/chatgptkeyword.png)

![Querying ChatGPT](Workflow/images/about/chatgpttextview.png)

* <kbd>↩&#xFE0E;</kbd> Ask a new question.
* <kbd>⌘</kbd><kbd>↩&#xFE0E;</kbd> Clear and start new chat.
* <kbd>⌥</kbd><kbd>↩&#xFE0E;</kbd> Copy last answer.
* <kbd>⌃</kbd><kbd>↩&#xFE0E;</kbd> Copy full chat.
* <kbd>⇧</kbd><kbd>↩&#xFE0E;</kbd> Stop generating answer.

#### Chat History

View Chat History with ⌥↩&#xFE0E; in the `chatgpt` keyword. Each result shows the first question as the title and the last as the subtitle.

![Viewing chat histories](Workflow/images/about/chatgpthistory.png)

<kbd>↩&#xFE0E;</kbd> to archive the current chat and load the selected one. Older chats can be trashed with the `Delete` [Universal Action](https://www.alfredapp.com/help/features/universal-actions/). Select multiple chats with the [File Buffer](https://www.alfredapp.com/help/features/file-search/#file-buffer).

### DALL·E

Query DALL·E via the `dalle` keyword.

![Start DALL-E query](Workflow/images/about/dallekeyword.png)

![Querying DALL-E](Workflow/images/about/dalletextview.png)

* <kbd>↩&#xFE0E;</kbd> Send a new prompt.
* <kbd>⌘</kbd><kbd>↩&#xFE0E;</kbd> Archive images.
* <kbd>⌥</kbd><kbd>↩&#xFE0E;</kbd> Reveal last image in the Finder.
