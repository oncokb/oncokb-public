package org.mskcc.cbio.oncokb.service;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.SendGridProperties;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridMailRequest;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridRecipient;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSendResult;
import org.mskcc.cbio.oncokb.service.dto.sendgrid.SendGridSuppression;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class SendGridServiceTest {

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void isConfigured_returnsExpectedValues() {
        ApplicationProperties applicationProperties = new ApplicationProperties();
        SendGridService sendGridService = new SendGridService(applicationProperties);

        assertThat(sendGridService.isConfigured()).isFalse();

        SendGridProperties sendGridProperties = new SendGridProperties();
        applicationProperties.setSendgrid(sendGridProperties);

        sendGridProperties.setEnabled(true);
        sendGridProperties.setApiKey(" ");
        sendGridProperties.setBaseUrl("http://localhost:8086");
        assertThat(sendGridService.isConfigured()).isFalse();

        sendGridProperties.setApiKey("test-key");
        sendGridProperties.setBaseUrl("http://localhost:8086");
        assertThat(sendGridService.isConfigured()).isTrue();
    }

    @Test
    void sendTemplatedMail_postsPayloadAndBearerAuth() throws Exception {
        AtomicReference<String> authHeader = new AtomicReference<>();
        AtomicReference<String> payload = new AtomicReference<>();
        AtomicReference<String> method = new AtomicReference<>();

        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v3/mail/send", exchange -> {
            method.set(exchange.getRequestMethod());
            authHeader.set(exchange.getRequestHeaders().getFirst("Authorization"));
            try (InputStream inputStream = exchange.getRequestBody()) {
                payload.set(readRequestBody(inputStream));
            }
            byte[] response = "{\"message\":\"accepted\"}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.getResponseHeaders().add("X-Message-Id", "mock-message-id");
            exchange.sendResponseHeaders(202, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();

        SendGridService sendGridService = new SendGridService(buildApplicationProperties(server.getAddress().getPort()));

        SendGridRecipient recipient = new SendGridRecipient();
        recipient.setToEmail("user@example.org");
        recipient.setDynamicTemplateData(new LinkedHashMap<>());

        SendGridMailRequest request = new SendGridMailRequest();
        request.setFromEmail("no-reply@oncokb.org");
        request.setTemplateId("d-template");
        request.setRecipients(Collections.singletonList(recipient));

        SendGridSendResult response = sendGridService.sendTemplatedMail(request);

        assertThat(response.getStatusCode()).isEqualTo(202);
        assertThat(response.getMessageId()).isEqualTo("mock-message-id");
        assertThat(method.get()).isEqualTo("POST");
        assertThat(authHeader.get()).isEqualTo("Bearer test-api-key");
        assertThat(payload.get()).contains("\"template_id\":\"d-template\"");
    }

    @Test
    void asmEndpoints_useExpectedPathsAndMethods() throws Exception {
        AtomicReference<String> getPath = new AtomicReference<>();
        AtomicReference<String> postMethod = new AtomicReference<>();
        AtomicReference<String> postPath = new AtomicReference<>();
        AtomicReference<String> postPayload = new AtomicReference<>();
        AtomicReference<String> deleteMethod = new AtomicReference<>();
        AtomicReference<String> deletePath = new AtomicReference<>();

        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v3/asm/suppressions/", exchange -> {
            getPath.set(exchange.getRequestURI().getPath());
            byte[] response = "{\"suppressions\":[]}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.createContext("/v3/asm/groups/123/suppressions", exchange -> {
            postMethod.set(exchange.getRequestMethod());
            postPath.set(exchange.getRequestURI().getPath());
            try (InputStream inputStream = exchange.getRequestBody()) {
                postPayload.set(readRequestBody(inputStream));
            }
            byte[] response = "{\"recipient_emails\":[\"user@example.org\"]}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(201, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.createContext("/v3/asm/groups/123/suppressions/", exchange -> {
            deleteMethod.set(exchange.getRequestMethod());
            deletePath.set(exchange.getRequestURI().getPath());
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
        });
        server.start();

        SendGridService sendGridService = new SendGridService(buildApplicationProperties(server.getAddress().getPort()));

        List<SendGridSuppression> getResponse = sendGridService.getSuppressionsForEmail("user@example.org");
        sendGridService.addGroupSuppression(123L, "user@example.org");
        sendGridService.removeGroupSuppression(123L, "user@example.org");

        assertThat(getResponse).isNotNull();
        assertThat(getResponse).isEmpty();
        assertThat(getPath.get()).endsWith("/v3/asm/suppressions/user@example.org");

        assertThat(postMethod.get()).isEqualTo("POST");
        assertThat(postPath.get()).isEqualTo("/v3/asm/groups/123/suppressions");
        assertThat(postPayload.get()).contains("recipient_emails");

        assertThat(deleteMethod.get()).isEqualTo("DELETE");
        assertThat(deletePath.get()).isEqualTo("/v3/asm/groups/123/suppressions/user@example.org");
    }

    @Test
    void getSuppressionsForEmail_parsesGroupPayload() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v3/asm/suppressions/", exchange -> {
            byte[] response = "{\"suppressions\":[{\"id\":1001,\"name\":\"Developers\",\"description\":\"Developer updates\",\"is_default\":false,\"suppressed\":true}]}"
                .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();

        SendGridService sendGridService = new SendGridService(buildApplicationProperties(server.getAddress().getPort()));

        List<SendGridSuppression> suppressions = sendGridService.getSuppressionsForEmail("user@example.org");

        assertThat(suppressions).hasSize(1);
        assertThat(suppressions.get(0).getGroupId()).isEqualTo(1001L);
        assertThat(suppressions.get(0).getGroupName()).isEqualTo("Developers");
        assertThat(suppressions.get(0).isSuppressed()).isTrue();
    }

    @Test
    void getSuppressionsForEmail_ignoresUndocumentedGroupKeysForEmailEndpoint() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v3/asm/suppressions/", exchange -> {
            byte[] response = "{\"suppressions\":[{\"group_id\":1001,\"group_name\":\"Developers\",\"suppressed\":true}]}"
                .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();

        SendGridService sendGridService = new SendGridService(buildApplicationProperties(server.getAddress().getPort()));

        List<SendGridSuppression> suppressions = sendGridService.getSuppressionsForEmail("user@example.org");

        assertThat(suppressions).isEmpty();
    }

    @Test
    void sendTemplatedMail_throwsIntegrationExceptionOnHttpError() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v3/mail/send", exchange -> {
            byte[] response = "{\"errors\":[{\"message\":\"bad request\"}]}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(400, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();

        SendGridService sendGridService = new SendGridService(buildApplicationProperties(server.getAddress().getPort()));

        SendGridMailRequest request = new SendGridMailRequest();
        request.setFromEmail("no-reply@oncokb.org");
        request.setTemplateId("d-template");
        request.setRecipients(new ArrayList<>());

        try {
            sendGridService.sendTemplatedMail(request);
        } catch (SendGridIntegrationException e) {
            assertThat(e.getStatusCode()).isEqualTo(400);
            return;
        }

        throw new AssertionError("Expected SendGridIntegrationException");
    }

    private ApplicationProperties buildApplicationProperties(int port) {
        ApplicationProperties applicationProperties = new ApplicationProperties();
        SendGridProperties sendGridProperties = new SendGridProperties();
        sendGridProperties.setEnabled(true);
        sendGridProperties.setApiKey("test-api-key");
        sendGridProperties.setBaseUrl("http://localhost:" + port);
        applicationProperties.setSendgrid(sendGridProperties);
        return applicationProperties;
    }

    private String readRequestBody(InputStream inputStream) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            outputStream.write(buffer, 0, bytesRead);
        }
        return new String(outputStream.toByteArray(), StandardCharsets.UTF_8);
    }
}
