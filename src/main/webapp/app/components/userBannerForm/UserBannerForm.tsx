import React, { useCallback } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { UserBannerMessageDTO } from 'app/shared/api/generated/API';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { AvField, AvForm, AvValidator } from 'availity-reactstrap-validation';
import {
  SHORT_TEXT_VAL,
  textValidation,
} from 'app/shared/utils/FormValidationUtils';

type UserBannerType = UserBannerMessageDTO['bannerType'];

type IUserBannerMessageFormProps = {
  onValidSubmit: (newUserBannerMessage: Partial<UserBannerMessageDTO>) => void;
  existingBannerMessage?: UserBannerMessageDTO;
};

export default function UserBannerForm({
  onValidSubmit,
  existingBannerMessage,
}: IUserBannerMessageFormProps) {
  const handleValidSubmit = useCallback(
    (_, userBanner: Partial<UserBannerMessageDTO>) => {
      onValidSubmit(userBanner);
    },
    [onValidSubmit]
  );
  return (
    <AvForm
      onValidSubmit={handleValidSubmit}
      onKeyPress={(event: any) => {
        if (event.which === 13 && event.target.type !== 'textarea') {
          event.preventDefault();
        }
      }}
    >
      <AvField name="id" type="hidden" value={existingBannerMessage?.id} />
      <Row>
        <Col md="3">
          <h5>Banner Type</h5>
        </Col>
        <Col md="9">
          <AvField
            name="bannerType"
            rows={6}
            type="select"
            value={existingBannerMessage?.bannerType ?? 'INFO'}
            validate={{
              required: {
                value: true,
                errorMessage: 'Message Type is required.',
              },
            }}
          >
            <option value="INFO">Info</option>
            <option value="ALERT">Alert</option>
          </AvField>
        </Col>
      </Row>
      <Row>
        <Col md="3">
          <h5>Message</h5>
        </Col>
        <Col md="9">
          <AvField
            name="content"
            placeholder="User Banner Message"
            rows={6}
            type="textarea"
            value={existingBannerMessage?.content}
            validate={{
              ...textValidation(2, 5000),
              required: {
                value: true,
                errorMessage: 'Your message is required.',
              },
            }}
          />
          <small className="text-muted">
            Give your message some flair: wrap words in **double asterisks** to
            embolden them, and surround link text with
            [brackets](https://example.com) so readers can follow your call to
            action.
          </small>
        </Col>
      </Row>
      <Row>
        <Col md="3">
          <h5>Start Date</h5>
        </Col>
        <Col md="9">
          <AvField
            name="startDate"
            rows={6}
            type="date"
            value={existingBannerMessage?.startDate}
            validate={{
              required: {
                value: true,
                errorMessage: 'Start date is required.',
              },
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col md="3">
          <h5>End Date</h5>
        </Col>
        <Col md="9">
          <AvField
            name="endDate"
            rows={6}
            type="date"
            value={existingBannerMessage?.endDate}
            validate={{
              required: {
                value: true,
                errorMessage: 'End date is required.',
              },
              dateOrder(value: string, ctx: UserBannerMessageDTO) {
                const start = ctx.startDate;
                if (!start || !value) return true;
                return (
                  new Date(start) <= new Date(value) ||
                  'Start Date Must Be Before End Date'
                );
              },
            }}
          />
          <small className="text-muted">
            Please note: our systems shift the end date backward when a time
            zone is attached. John tried to convince the code to do otherwise,
            but it refused to listen. If your banner disappears a day early, set
            this end date one day later than planned.
          </small>
        </Col>
      </Row>
      <Row className={getSectionClassName()}>
        <Col md="3">
          <h5>Review Information</h5>
        </Col>
        <Col md="9">
          <Button type="submit">
            {existingBannerMessage
              ? `Updated Banner Message ${existingBannerMessage.id}`
              : 'Create Banner Message'}
          </Button>
        </Col>
      </Row>
    </AvForm>
  );
}
