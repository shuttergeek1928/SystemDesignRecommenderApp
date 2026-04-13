Technology: JWT
Category: security

When to use:
* JWT size makes it suitable for HTML/HTTP environments
* verify integrity
* It offers a more compact representation compared to XML-based standards like SAML
* To check if expected claims are present in the payload
* When authorization needs to be granted and an access token required
* Authentication and authorization in stateless applications
* To ensure that the structure of the JWT is correct
* When checking if a trusted source issued it
* To ensure the token adheres to expected standards
* JSON Web Tokens provide stateless authentication mechanism
* securely transmit information between parties
* authenticate sender
* JWT provides secure token-based authentication that is easy to implement in HTML/HTTP environments
* Information Exchange
* For secure API communication
* JSON is less verbose than XML
* Authorization
* To provide useful and interoperable claims
* secure and stateless authentication
* When you need stateless authentication
* verify and trust integrity of claims
* Decoding to verify a JWT

When not to use:
* JWT is not suitable when you need to store sensitive data because it's just a string.
* JWT is not suitable for large amounts of data that need to be stored or transferred as it's a token, which has size limitations.

Tradeoffs:

Advantages:
* JWT validation ensures well-formed tokens with enforceable claims.
* More space-efficient than XML-based alternatives.
* Reduces the need to query database for certain operations
* Performance efficiency due to lack of session state management overhead
* They can carry user identity and claims securely between services without the need for session state on either side.
* Stateless authentication
* JSON Web Tokens (JWT) provide stateless authentication.
* no need to store session state on server
* compact way to securely transmit information as a JSON object
* JSON Web Tokens are compact, URL-safe and self-contained
* integrity verification
* Scalability
* can be digitally signed for verification and certification
* Small overhead for Single Sign On across different domains
* Smaller and more compact JWT compared to SAML
* Natural document-to-object mapping in JSON
* compact representation of claims
* Simple signing process with public/private key pair or HMAC algorithm for security
* Easy to pass as Base64-URL strings separated by dots, making it suitable for HTTP and HTML contexts.
* Easy integration with APIs for accessing protected resources.
* Using JWT with Auth0 allows you to implement security in less than 10 minutes.
* Easier client-side processing on multiple platforms, especially mobile
* Secure transmission of information between parties with verifiable sender and integrity check.
* Statelessness
* Efficient verification of token integrity and authenticity without needing the key.

Limitations:
* They can be vulnerable if the secret key used during token generation is compromised.
* Validation alone does not guarantee that a JWT has been issued by an authentic source.
* Requires additional computation for signature re-signing during decoding process
* Exposed information within the JWT is visible, even if it cannot be altered. Secret data should not be included in a signed token to prevent exposure of sensitive details.
* Some servers don't accept more than 8 KB in headers
* Requires great care due to security issues, should not keep tokens longer than required
* JWT tokens can get too big if trying to embed too much information
* Limited payload size
* Limited payload size (~1024 bytes)
* JWTs are not suitable for large amounts of data that require storage or transfer, due to size limitations and lack of payload capacity compared to traditional session-based methods.
* JWTs can be vulnerable to replay attacks if not properly secured
* Limited flexibility as all claims are statically defined at issuance time and can't change dynamically.
* requires a trusted signing party
* Verification is necessary to confirm the token's integrity and origin, which cannot be assured through validation only.
