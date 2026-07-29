job-app

Gemini 3.6 Flash (Medium)

>1. agy-ide:
Use ADK 2.0 to create a new graph workflow agent project called job-app-agent. I shall want to deploy this agent so that it can be queried from eg a Firefox browser on an Android phone. The workflow should act as a job application assistant for a jobseeker. It should first classify if the user request is to answer a specific job-application question, to provide a cover letter for a specific job-application, or something else. If something else, the request can be routed to a generic LLM. If the request is one of the two job-application types then it should be answered with reference to specific agent skills and persistent context which I will provide to you later.
<implementation_plan1.md
<walkthrough1.md

>2. agy-ide:
can you build a front end web UI for this agent using React.js. It should be a simple chatbot that accepts text requests and returns text responses.

>
that's fine but take out the "prompt suggestions" components
<implementation_plan2.md
<walkthrough2.md

>3. agy-ide:
modify agent.py - and cascade any necessary changes - so that there is only one agent. the instruction for each current agent should be converted into a skill for the resultant unified agent. this will ensure that the context memory is consistent for the user experience
<implementation_plan3.md

>4. agy-ide:
please put  the SKILLS in UNIFIED_AGENT_INSTRUCTION into separate SKILL.md files in an appropriate directory using the antigravity agent skills framework

<walkthrough4.md

>5. add to the front end a facility to upload a CV/resume in pdf format. this should then be propagated to the context for the llmagent. if a subsequent cv/resume is uploaded, the previous should be removed from the context window and the latest one added
<implementation_plan5.md
<walkthrough5.md

>6. can you repeat the above for the job description with the following changes: instead of an upload there will be a UI function to paste the job description as plain text into an embedded dialog box or similar
<implementation_plan6.md

>7. the Target Job pop-up text entry box is hidden behind the main central agent response box. Can you fix this

