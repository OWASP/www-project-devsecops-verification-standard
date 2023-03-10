# Hardcoded Secrets Detection

| ID             |
| -------------- |
| DSOVS-CODE-002 |

## Summary

Hardcoded secrets scanning is a security process used in DevSecOps that involves scanning code for hardcoded passwords, tokens, and other identifying information. 

The goal of hardcoded secrets scanning is to identify and replace any insecurely stored credentials or secrets, as these can be exploited by malicious actors. 

The process typically involves scanning source code, configuration files, and other related artifacts for secrets, which are then checked against appropriate levels of access control. 

Any secrets that are deemed insecure are then reported to the relevant parties and can be replaced with more secure alternatives.

## Level 0 - No tool to perform hardcoded secret scanning

At this level of security maturity, there are no tools available to perform secret scanning. 

## Level 1 - Verify use of tool to perform on-demand scan to identify hardcoded secrets in the source code

At this stage, a secrets detection tool is present but the scanning is performed on a case-by-case basis. It is not automated and the results may not be reported or recorded. 

## Level 2 - Verify the implementation of the hardcoded secrets scanning tool into the build pipeline to perform automated scans and report status to the build

Here, secrets scanning is implemented into the software build pipeline. This means that whenever a build is executed, an automated secrets scan will be triggered and the results will be reported.

## Level 3 - Verify that the findings are automatically recorded to a centralised issue tracker system and periodically review tool's effectiveness

Level 3 of secrets scannnig is the same as level 2, with the addition of all identified security vulnerabilities being recorded in a centralised issue tracking system and periodically reviewed to evaluate the effectiveness of the secrets detection tool. This means that the same type of automated scans are being performed, but the results are being collected, tracked and analysed for future use and improvement.

# Notable Tools 

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

## [Gitleaks](https://github.com/awslabs/git-secrets)

Gitleaks is a SAST tool for detecting and preventing hardcoded secrets like passwords, api keys, and tokens in git repos. Gitleaks is an easy-to-use, all-in-one solution for detecting secrets, past or present, in your code.

<a href="https://github.com/gitleaks/gitleaks-action"><img src="images/github.svg" width="20px"> GitHub Actions

```
name: gitleaks
on:
  pull_request:
  push:
  workflow_dispatch:
  schedule:
    - cron: "0 4 * * *" # run once a day at 4 AM
jobs:
  scan:
    name: gitleaks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE}} # Only requir
```

<a href="https://badshah.io/experiment/adding-gitleaks-to-gitlab-pipeline/"><img src="images/gitlab.svg" width="20px"> GitLab CI

```
stages:
  - secrets-detection

gitleaks:
  stage: secrets-detection
  image: 
    name: "zricethezav/gitleaks"
    entrypoint: [""]
  script: gitleaks -v --pretty --repo-path . --commit-from=$CI_COMMIT_SHA --commit-to=$CI_COMMIT_BEFORE_SHA --branch=$CI_COMMIT_BRANCH
```

<a href="https://github.com/JoostVoskuil/azure-devops-gitleaks"><img src="images/azure.svg" width="40px"> Azure DevOps </a>

```
name: '2.0$(rev:.r)'

trigger:
- main
- feature/*
- features/*
- bugfix/*

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: 'Build'
  displayName: 'Build'
  jobs:
  - job: 
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '16.x'
      displayName: 'Install Node.js'
    
    - template: build-and-test.yml
      parameters:
        path: task/v2
        name: Gitleaks V2
  
    - task: TfxInstaller@3
      displayName: 'Use Node CLI for Azure DevOps'
      inputs:
        version: '0.9.x'
        checkLatest: true

    - task: PackageAzureDevOpsExtension@3
      displayName: 'Package Extension: $(Build.SourcesDirectory)'
      name: 'packageStep'
      inputs:
        rootFolder: '$(Build.SourcesDirectory)'
        outputPath: '$(Build.ArtifactStagingDirectory)/foxholenl-gitleaks.vsix'
        publisherId: 'foxholenl'
        extensionId: 'Gitleaks'
        extensionName: 'Gitleaks'
        extensionTag: '-build'
        extensionVersion: '$(Build.BuildNumber)'
        extensionVisibility: private

    - task: PublishPipelineArtifact@1
      displayName: 'Publish vsix'
      inputs:
        publishLocation: pipeline
        targetPath: '$(packageStep.Extension.OutputPath)'
        artifact: 'vsix'
      condition: succeededOrFailed()

- stage: Test
  displayName: 'Publish to Marketplace (private)'
  condition: and(succeeded(), ne(variables['Build.Reason'], 'PullRequest'))
  dependsOn: 'Build'
  jobs:
    - deployment: 
      environment: Test
      strategy: 
        runOnce:
         deploy:
          steps:

          - task: TfxInstaller@3
            displayName: 'Use Node CLI for Azure DevOps'
            inputs:
              version: '0.9.x'
              checkLatest: true

          - task: PublishAzureDevOpsExtension@3
            name: 'PublishTest'
            inputs:
              connectTo: 'VsTeam'
              connectedServiceName: 'Marketplace'
              fileType: 'vsix'
              vsixFile: '$(Pipeline.Workspace)/vsix/foxholenl-gitleaks.vsix'
              publisherId: 'foxholenl'
              extensionId: 'Gitleaks'
              extensionTag: '-dev'
              updateTasksVersion: false
              extensionVisibility: 'privatepreview'
              shareWith: 'foxholenl'
              noWaitValidation: true

- stage: Production
  displayName: 'Publish to Marketplace (Public)'
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  dependsOn: 'Test'
  jobs:
    - deployment: 
      environment: Production
      strategy: 
        runOnce:
          deploy:
            steps:
            - task: TfxInstaller@3
              displayName: 'Use Node CLI for Azure DevOps'
              inputs:
                version: '0.9.x'
                checkLatest: true

            - task: PublishAzureDevOpsExtension@3
              name: 'PublishProd'
              inputs:
                connectTo: 'VsTeam'
                connectedServiceName: 'Marketplace'
                fileType: 'vsix'
                vsixFile: '$(Pipeline.Workspace)/vsix/foxholenl-gitleaks.vsix'
                publisherId: 'foxholenl'
                extensionId: 'Gitleaks'
                updateTasksVersion: false
                extensionVisibility: 'public'
                noWaitValidation:  true
```

## 🙏 Credits

We could not do this without the amazing contributions made to the community so we'd like to take the time to show our appreciation to any external inspiration used. 

* [Joost Voskuil](https://github.com/JoostVoskuil)
* [Chandrapal Badshah](https://www.linkedin.com/in/bnchandrapal/?originalSubdomain=in)