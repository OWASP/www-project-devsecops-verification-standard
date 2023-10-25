# Secure Dependency Management

| ID             |
| -------------- |
| DSOVS-CODE-009 |

## Summary

Secure Dependency Management is the process of identifying, managing, and tracking all software dependencies when building, deploying, and managing applications. 

It is an important part of DevSecOps because it helps to ensure that all applications built using open source and commercial dependencies are secure and up-to-date. 

By properly managing dependencies, organizations can help mitigate risk from known vulnerabilities in their application stack and keep critical applications updated with the latest security patches.

## Level 0 - Direct use of public repositories for third-party dependencies and libraries

At this level, there is no structured process for identifying, managing, or tracking software dependencies in the development and deployment of applications. Organizations operating at this level may have a high degree of vulnerability to known security issues in their application stack. There is no systematic effort to ensure dependencies are secure and up-to-date, leaving applications exposed to risks.

## Level 1 - Verity implementation of a private repository to manage third-party dependencies and libraries, with basic dependency management

At this stage, organizations begin implementing basic dependency management practices. They may have rudimentary tools or manual processes in place to identify and manage dependencies. However, these practices might be fragmented, and there is limited automation. While some attention is given to dependency security, it may not be comprehensive, and updates might be infrequent. Level 1 represents an initial effort to mitigate risks. A private registry is used, however it is configured as a proxy in front of public registries and repositories.

## Level 2 - Verify that only verified third-party dependencies and libraries can be used by the application

Level 2 signifies the adoption of a centralized approach to dependency management within the DevSecOps workflow. Organizations use dedicated tools and processes to track, monitor, and manage dependencies. Security processes related to dependency management are defined and adopted, such as quality gates within CI/CD which prevent a 'High' or 'Critical' rated vulnerability in a third-party dependency from being deployed into Production, breaking the build. Exemption processes exist. 
These tools may automatically identify vulnerabilities in dependencies and provide a systematic way to apply updates and patches. Dependency management is better integrated into the CI/CD pipeline, ensuring that applications are built and deployed with more secure dependencies. While this level represents a significant improvement in security, there is still room for more extensive automation and governance.

## Level 3 - End to end automation and verification of the implementation to monitor application uses of third-party dependencies and libraries with process to retire unused or vulnerable dependencies

Level 3 represents the pinnacle of dependency management in DevSecOps.

At this advanced level, organizations have achieved a state of fully automated and continuous dependency management. Tools and processes are seamlessly integrated into the CI/CD pipeline to ensure that applications are consistently built, deployed, and maintained with secure and up-to-date dependencies. Automated scans and checks for vulnerabilities are performed regularly, and any issues are promptly addressed. This level of maturity provides the highest degree of security and risk mitigation, ensuring that applications are always built and maintained with the latest security patches and updates, aligning perfectly with DevSecOps principles. Developer culture is tightly aligned to treating a vulnerability, especially where it relates to a third party dependency, as a product defect or bug and dealt with in a prioritised manner. 

Generation of SBOM (Software Bill of Material) is integrated into CI/CD, serving as
a comprehensive and structured list of all components and their dependencies
within an application.



## References
