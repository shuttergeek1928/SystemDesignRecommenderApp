Technology: OAuth2
Category: security

When to use:
* Additional security properties on top of OAuth 2.0
* indicates the authorization server identifier in the authorization response
* When you need to delegate user authentication
* When you need to access protected resources on behalf of a user
* for delegating access to resources without sharing credentials
* Authorization Code
* For applications that require access tokens for third-party APIs
* PKCE
* When you need a simple, decentralized authentication mechanism without the complexity of full OAuth flows.
* To leverage the simplified authorization flow
* Client metadata management
* integrating with existing identity systems
* as a secure way of granting third-party applications limited access
* For applications that require a secure and user-friendly authentication mechanism
* Cross-Application access
* OAuth 2.0 is an industry-standard for authorization

When not to use:
* OAuth 1.0 is deprecated

Tradeoffs:

Advantages:
* Enhances security by delegating credentials management
* Simplified client flows
* IndieAuth enables users to authenticate using their existing social media accounts without sharing sensitive information.
* Improved user experience with Cross-App Access.
* Enhanced security through client ID Metadata.
* OAuth provides more granular control over permissions
* Facilitates easier integration with external services without handling user authentication directly
* Flexibility in allowing different levels and durations of access for various services or resources
* OpenID Connect provides identity verification and session management.
* UMA allows for fine-grained consent delegation between clients, service providers, and resource owners.
* It separates the account information from application-specific data
* Enhanced authentication and authorization mechanisms.
* enables integration with SAML2 and JWT Bearer Assertions for seamless authentication experiences.
* Reduces the risk of phishing attacks
* Enhances security by using public key cryptography
* Enhanced security by using tokens instead of passwords
* Additional security properties on top of OAuth 2.0 with PAR.
* Improved security features

Limitations:
* UMA's fine-grained consent delegation can introduce complexity in client implementation and understanding of the protocol.
* Requires additional infrastructure to manage tokens and endpoints
* Requires careful consideration to avoid misuse or overextension
* Complexity in setup and implementation can be a barrier to entry, especially without proper understanding
* Not finalized, still under development
* Requires users to have a compatible device with biometric sensors
* Potential complexity in implementation of XAA and Client ID Metadata Document
* Can introduce complexity in the application flow if not implemented correctly
* IndieAuth relies on social media platforms, which might not be available or preferred by all users.
* Requires additional infrastructure for token issuance and validation
* requires additional extensions to be implemented, which can increase complexity
* Complexity in implementation can lead to security vulnerabilities if not done correctly
* OpenID Connect may require additional setup compared to OAuth2 alone for identity verification purposes.
