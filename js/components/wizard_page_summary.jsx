import React from 'react';
import PropTypes from 'prop-types';
import { useWizard } from '../stores/wizard_store';
import PageTemplate from './wizard_template_page';
import Button from './wizard_component_button';
import BodyText from './wizard_component_body_text';
import Constrain from './wizard_layout_constrain';
import LastStepsBlock from './wizard_component_last_steps_block';
import RichText from './wizard_component_rich_text';
import WizardHtml from './wizard_html';

function Summary() {
  const {
    actions, activity, loading, request,
  } = useWizard();
  const {
    agencies, links, isError,
  } = request;

  if (activity.type !== 'summary') {
    throw new Error('Not a summary activity');
  }

  if (isError) {
    return (
      <PageTemplate>
        <Constrain>
          <BodyText>
            There was an error, please try again later.
          </BodyText>
        </Constrain>
      </PageTemplate>
    );
  }

  if (loading) {
    return (
      <PageTemplate>
        <Constrain>
          <BodyText>
            Loading...
          </BodyText>
        </Constrain>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <Constrain>
        <RichText>
          {typeof activity.titleMid === 'string' ? (
            // Topic/answer-specific content
            <WizardHtml mid={activity.titleMid} />
          ) : (
          // Show agencies & links from model
            <>
              <p>We did a quick search for:</p>
              <blockquote>
                &ldquo;
                {request.query}
                &ldquo;
              </blockquote>

              { (!links || links.length === 0) && (!agencies || agencies.length === 0) ? (
                <WizardHtml mid="polydeltaNoResults" />
              ) : (
                null
              )}
              {links && links.length > 0 ? (
                <>
                  <h2>We found the following public information:</h2>
                  <WizardLinks links={links} />
                </>
              ) : (
                null
              )}
              {agencies && agencies.length > 0 ? (
                <>
                  <h2>The following agencies may have the records you seek.</h2>
                  <p>Click each agency to learn more or to submit a FOIA request.</p>
                  <WizardAgencies agencies={agencies} />
                </>
              ) : (
                null
              )}
            </>
          )}
          <LastStepsBlock />
        </RichText>
        <Button onClick={actions.reset}>
          Reset
        </Button>
      </Constrain>
    </PageTemplate>
  );
}

/**
 * @param {object} props
 * @param {WizardLink[]} props.links
 */
function WizardLinks({ links }) {
  return (
    <ul>
      {links.map((link) => (
        /** this key is a lot, but sometimes the urls are not unique
            and the agency + tag combo is also typically not unique */
        <li key={link.agency + link.tag + link.url} data-score={link.score}>
          <p>{`${link.agency}: ${link.tag}`}</p>
          <a href={link.url}>{link.sentence}</a>
          {' '}
          {`(Confidence Score: ${link.score.toFixed(4)})`}
        </li>
      ))}
    </ul>
  );
}
WizardLinks.propTypes = {
  links: PropTypes.array,
};

/**
 * @param {object} props
 * @param {WizardAgency[]} props.agencies
 */
function WizardAgencies({ agencies }) {
  return (
    <ul>
      {agencies.map((agency) => (
        <li key={agency.agency} data-score={agency.confidence_score}>
          <a href={agency.url}>{`${agency.agency_abbrev}: ${agency.agency}`}</a>
          <br />
          {`(Confidence Score: ${agency.confidence_score.toFixed(4)})`}
        </li>
      ))}
    </ul>
  );
}
WizardAgencies.propTypes = {
  agencies: PropTypes.array,
};

export default Summary;
