Feature: Free file size limit

  Scenario: A free user tries to upload a file larger than the limit
    Given a file size limit of 5 MB
    When a free user uploads a file of size 6 MB
    Then an error should be thrown with status 413
