import React, {useEffect, useState} from 'react'
import {Contract} from "near-api-js";

import {
  MDBBadge,
  MDBBox,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardHeader, MDBCardText, MDBCol,
  MDBContainer, MDBIcon, MDBLink, MDBMask,
  MDBModal,
  MDBModalBody,
  MDBModalFooter,
  MDBModalHeader, MDBPopover, MDBPopoverBody, MDBRow, MDBTooltip, MDBView
} from "mdbreact";
import {useGlobalState} from './utils/container'
import {convertDuration, timestampToReadable, yoktoNear} from './utils/funcs'
import Navbar from "./Navbar";
import Footer from "./Footer";
import {useParams} from "react-router-dom";
import Decimal from "decimal.js";

export const Proposal = (props) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const stateCtx = useGlobalState();
  const [votedWarning, setVotedWarning] = useState(false);
  const [votes, setVotes] = useState({
    approved: 0,
    rejected: 0,
    removed: 0,
  });

  //console.log(props)

  const vote = async (vote) => {
    try {
      setShowSpinner(true);
      await window.contract.act_proposal({
        id: props.id,
        action: vote,
      }, new Decimal("250000000000000").toString())
    } catch (e) {
      console.log(e);
      props.setShowError(e);
    } finally {
      setShowSpinner(false);
    }
  }

  const finalize = async () => {
    try {
      setShowSpinner(true);
      await window.contract.act_proposal({
        id: props.id,
        action: "Finalize"
      })
    } catch (e) {
      console.log(e);
      props.setShowError(e);
    } finally {
      setShowSpinner(false);
    }
  }

  const handleVoteYes = () => {

    if (props.data.votes[window.walletConnection.getAccountId()] === undefined) {
      vote('VoteApprove').then().catch((e) => {
        console.log(e);
      });
    } else {
      setVotedWarning(true);
    }
  }

  const handleVoteNo = () => {
    if (props.data.votes[window.walletConnection.getAccountId()] === undefined) {
      vote('VoteReject').then().catch((e) => {
        console.log(e);
      });
    } else {
      setVotedWarning(true);
    }
  }
  const handleVoteRemove = () => {
    if (props.data.votes[window.walletConnection.getAccountId()] === undefined) {
      vote('VoteRemove').then().catch((e) => {
        console.log(e);
      });
    } else {
      setVotedWarning(true);
    }
  }

  const handleFinalize = () => {
    finalize().then().catch((e) => {
      console.log(e);
    });
  }

  const toggleVoteWarningOff = () => {
    setVotedWarning(false);
  }



  useEffect(
    () => {
      if (props.data.votes && Object.keys(props.data.votes).length !== 0) {
        let vrj = 0;
        let vap = 0;
        let vrm = 0;

        Object.keys(props.data.votes).map((item, key) => {
          if (props.data.votes[item] === 'Reject') {
            vrj = vrj + 1;
          }

          if (props.data.votes[item] === 'Approve') {
            vap = vap + 1;
          }

          if (props.data.votes[item] === 'Remove') {
            vrm = vrm + 1;
          }

        })

        setVotes({
          approved: vap,
          rejected: vrj,
          removed: vrm,
        })

      }
    },
    [props.data.votes]
  )

  console.log(props.data);

  return (
    <>
      {props.data.kind ?
        <MDBCol className="col-12 col-sm-8 col-lg-6 mx-auto">
          <MDBModal modalStyle="danger" centered size="sm" isOpen={votedWarning} toggle={toggleVoteWarningOff}>
            <MDBModalHeader>Warning!</MDBModalHeader>
            <MDBModalBody className="text-center">
              You are already voted
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn className="w-100" color="info" onClick={toggleVoteWarningOff}>Close</MDBBtn>
            </MDBModalFooter>
          </MDBModal>

          <MDBCard className="mb-5 stylish-color white-text">
            <MDBCardHeader className="text-center h4-responsive">

              {props.data.kind === 'ChangeConfig' ? "Change Config: " : null}
              {props.data.kind === 'ChangePolicy' ? "Change Policy: " : null}
              {props.data.kind.AddMemberToRole && props.data.kind.AddMemberToRole.role === 'council' ? "Add " + props.data.kind.AddMemberToRole.member_id + " to the council" : null}
              {props.data.kind === 'RemoveMemberFromRole' ? "RemoveMemberFromRole: " + props.data.target : null}
              {props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' ? "Create token" : null}
              {props.data.kind === 'UpgradeSelf' ? "UpgradeSelf: " + props.data.target : null}
              {props.data.kind === 'UpgradeRemote' ? "UpgradeRemote: " + props.data.target : null}
              {props.data.kind === 'Transfer' ? "Transfer: " + props.data.target : null}
              {props.data.kind === 'SetStakingContract' ? "SetStakingContract: " + props.data.target : null}
              {props.data.kind === 'AddBounty' ? "AddBounty: " + props.data.target : null}
              {props.data.kind === 'BountyDone' ? "BountyDone: " + props.data.target : null}
              {props.data.kind === 'Vote' ? "Vote: " + props.data.target : null}

              {/*
          {props.data.kind.type === "Payout" ?
            <div>
              <div className="float-left">
                Payout:
              </div>
              <div className="float-right font-weight-bold" style={{fontSize: 25}}>
                <span style={{fontSize: 22, marginRight: 2}}>Ⓝ</span>
                {(props.data.kind.amount / yoktoNear).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            </div>
            : null}
          <div className="clearfix"/>
          */}

            </MDBCardHeader>
            <MDBCardBody className="white-text">
              <div className="float-left">
                {props.data.kind.AddMemberToRole ?
                  <MDBIcon icon="user-secret" className="white-text mr-2 d-inline-block" size="2x"/> : null}

                {props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' ?
                  <MDBIcon icon="tractor" className="white-text mr-2 d-inline-block" size="2x"/> : null}

                {props.data.status === 'Rejected' ?
                  <MDBBadge color="danger">Rejected</MDBBadge>
                  :
                  null
                }
                {props.data.status === 'Approved' ?
                  <><MDBBadge color="green">Approved</MDBBadge>{" "}<MDBIcon
                    className="amber-text" size="2x"
                    icon="crown"/></>
                  :
                  null
                }
                {props.data.status === 'InProgress' && convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) >= new Date() ?
                  <MDBBadge color="green">In Progress</MDBBadge>
                  :
                  null
                }
                {props.data.status === 'Expired' || (props.data.status === 'InProgress' && convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date())?
                  <MDBBadge color="amber">Expired</MDBBadge>
                  :
                  null
                }
                {props.data.status === 'Removed' ?
                  <MDBBadge color="yellow">Removed</MDBBadge>
                  :
                  null
                }
              </div>
              <div className="float-right h4-responsive"><a className="white-text btn-link"
                                                            href={"#/" + props.dao + "/" + props.id}
                                                            target="_blank"><MDBIcon icon="link"/></a> #{props.id}</div>
              <div className="clearfix"/>
              <MDBCardText>
                <MDBBox
                  className="h4-responsive white-text">{props.data.description.split('/t/')[0]}</MDBBox>
                {props.data.description.split('/t/')[1] ?
                  <a target="_blank"
                     href={"https://gov.near.org/t/" + props.data.description.split('/t/')[1]}
                     rel="nofollow">{"https://gov.near.org/t/" + props.data.description.split('/t/')[1]}</a>
                  : null}
                <hr/>
                <div className="float-left text-muted h4-responsive">proposer</div>
                <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                  <a className="text-right float-right white-text btn-link" target="_blank"
                     style={{wordBreak: "break-word"}}
                     href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.proposer.toLowerCase()}>{props.data.proposer.toLowerCase()}</a>
                </MDBBox>
                <br/>
                <div className="clearfix"/>
                <div className="float-left text-muted h4-responsive">target</div>

                {props.data.kind.FunctionCall && props.data.kind.FunctionCall.actions[0].method_name === 'create_token' ?
                  <>
                    <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                      <a className="text-right float-right white-text btn-link" target="_blank"
                         style={{wordBreak: "break-word"}}
                         href={stateCtx.config.network.explorerUrl + "/accounts/" + JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.owner_id}>
                        {JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.owner_id}</a>
                    </MDBBox>
                    <MDBBox className="float-left h5-responsive white-text" style={{width: '80%'}}>
                      total
                      supply:{" "}<span
                      style={{fontSize: 18}}>Ⓝ</span>{new Decimal(JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.total_supply).div(yoktoNear).toFixed(0).toString()}
                    </MDBBox>
                    <MDBBox className="float-left h5-responsive white-text" style={{width: '80%'}}>
                      decimals:{" "}{JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.metadata.decimals}
                    </MDBBox>
                    <MDBBox className="float-left h5-responsive white-text" style={{width: '80%'}}>
                      name:{" "}{JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.metadata.name}
                    </MDBBox>
                    <MDBBox className="float-left h5-responsive white-text" style={{width: '80%'}}>
                      symbol:{" "}{JSON.parse(atob(props.data.kind.FunctionCall.actions[0].args)).args.metadata.symbol}
                    </MDBBox>
                  </> : null}

                {props.data.kind.AddMemberToRole ?
                  <>
                    <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                      <a className="text-right float-right white-text btn-link" target="_blank"
                         style={{wordBreak: "break-word"}}
                         href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.AddMemberToRole.member_id}>
                        {props.data.kind.AddMemberToRole.member_id}</a>
                    </MDBBox>
                  </> : null}

                {/*
                  <MDBBox className="float-right h4-responsive" style={{width: '80%'}}>
                    <a className="text-right float-right white-text btn-link" target="_blank" style={{wordBreak: "break-word"}}
                       href={stateCtx.config.network.explorerUrl + "/accounts/" + props.data.kind.AddMemberToRole.member_id}>{props.data.kind.AddMemberToRole.member_id}</a>
                  </MDBBox>
                */}
                <div className="clearfix"/>
              </MDBCardText>

              {props.council.includes(window.walletConnection.getAccountId()) ?
                <MDBTooltip
                  tag="span"
                  placement="top"
                >
                  <MDBBtn
                    style={{borderRadius: 50}}
                    disabled={showSpinner || convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date() || props.data.status !== 'InProgress'}
                    onClick={handleVoteYes}
                    floating
                    color="green darken-1"
                    className='h5-responsive'
                    size="sm">
                    <MDBIcon icon='thumbs-up' size="2x" className='white-text m-2 p-2'/>
                  </MDBBtn>
                  <span>Vote YES</span>
                </MDBTooltip>
                : null}

              {((props.data.proposer === window.walletConnection.getAccountId() || props.council.includes(window.walletConnection.getAccountId())) && convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date() && props.data.status === 'InProgress') ?
                <MDBTooltip
                  tag="span"
                  placement="top"
                >
                  <MDBBtn
                    style={{borderRadius: 50}}
                    disabled={showSpinner}
                    onClick={handleFinalize}
                    color="info"
                    floating
                    className='h5-responsive float-right'
                    size="sm">
                    <MDBIcon icon="check-circle" size="2x" className='white-text m-2 p-2'/>
                  </MDBBtn>
                  <span>Finalise</span>
                </MDBTooltip>
                : null}

              {props.council.includes(window.walletConnection.getAccountId()) ?
                <MDBTooltip
                  tag="span"
                  placement="top"
                >
                  <MDBBtn
                    style={{borderRadius: 50}}
                    disabled={showSpinner || convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date() || props.data.status !== 'InProgress'}
                    onClick={handleVoteNo}
                    color="red"
                    floating
                    className='h5-responsive float-right'
                    size="sm">
                    <MDBIcon icon='thumbs-down' size="2x" className='white-text m-2 p-2'/>
                  </MDBBtn>
                  <span>Vote NO</span>
                </MDBTooltip>
                : null}

              {props.council.includes(window.walletConnection.getAccountId()) ?
                <MDBTooltip
                  tag="span"
                  placement="top"
                >
                  <MDBBtn
                    style={{borderRadius: 50}}
                    disabled={showSpinner || convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)) < new Date() || props.data.status !== 'InProgress'}
                    onClick={handleVoteRemove}
                    color="amber"
                    floating
                    className='h5-responsive float-right'
                    size="sm">
                    <MDBIcon icon='trash-alt' size="2x" className='white-text m-2 p-2'/>
                  </MDBBtn>
                  <span>Remove Proposal</span>
                </MDBTooltip>
                : null}

            </MDBCardBody>
            <div className='rounded-bottom mdb-color text-center pt-3 pl-5 pr-5'>
              <ul className='list-unstyled list-inline font-small'>
                <li className='list-inline-item pr-2 white-text h4-responsive'>
                  <MDBIcon far
                           icon='clock'/>{" "}{convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)).toLocaleDateString()} {convertDuration(new Decimal(props.data.submission_time).plus(props.daoPolicy.proposal_period)).toLocaleTimeString()}
                </li>

                <li className='list-inline-item pr-2'>
                  <div>
                    {props.data.votes !== undefined && Object.keys(props.data.votes).length !== 0 && Object.values(props.data.votes).includes('Approve') ?
                      <MDBPopover
                        placement="top"
                        popover
                        clickable
                        domElement='div'
                        id="popover1"
                      >
                        <div className="d-inline-block">
                          <MDBIcon icon='thumbs-up' size="2x" className='lime-text mr-1'/>
                        </div>
                        <div>
                          <MDBPopoverBody>
                            <div className="h4-responsive">
                              {
                                Object.keys(props.data.votes).map((item, key) => (
                                  <>
                                    {props.data.votes[item] === 'Approve' ?
                                      <li key={key}>{item}</li>
                                      : null
                                    }
                                  </>
                                ))

                              }
                            </div>
                          </MDBPopoverBody>
                        </div>
                      </MDBPopover>
                      :
                      <MDBIcon icon='thumbs-up' size="2x" className='lime-text mr-1'/>
                    }
                    <span className="white-text h3-responsive">{votes.approved}</span>
                  </div>
                </li>

                <li className='list-inline-item pr-2'>
                  <div>
                    {props.data.votes !== undefined && Object.keys(props.data.votes).length !== 0 && Object.values(props.data.votes).includes('Remove') ?
                      <MDBPopover
                        placement="top"
                        popover
                        clickable
                        domElement='div'
                        id="popover1"
                      >
                        <div className="d-inline-block">
                          <MDBIcon icon='trash-alt' size="2x" className='amber-text mr-1'/>
                        </div>
                        <div>
                          <MDBPopoverBody>
                            <div className="h4-responsive">
                              {
                                Object.keys(props.data.votes).map((item, key) => (
                                  <>
                                    {props.data.votes[item] === 'Remove' ?
                                      <li key={key}>{item}</li>
                                      : null
                                    }
                                  </>
                                ))

                              }
                            </div>
                          </MDBPopoverBody>
                        </div>
                      </MDBPopover>
                      :
                      <MDBIcon icon='trash-alt' size="2x" className='amber-text mr-1'/>
                    }
                    <span className="white-text h3-responsive">{votes.rejected}</span>
                  </div>
                </li>

                <li className='list-inline-item pr-2'>
                  <div>
                    {props.data.votes !== undefined && Object.keys(props.data.votes).length !== 0 && Object.values(props.data.votes).includes('Reject') ?
                      <MDBPopover
                        placement="top"
                        popover
                        clickable
                        domElement='div'
                        id="popover1"
                      >
                        <div className="d-inline-block">
                          <MDBIcon icon='thumbs-down' size="2x" className='red-text mr-1'/>
                        </div>
                        <div>
                          <MDBPopoverBody>
                            <div className="h4-responsive">
                              {
                                Object.keys(props.data.votes).map((item, key) => (
                                  <>
                                    {props.data.votes[item] === 'Reject' ?
                                      <li key={key}>{item}</li>
                                      : null
                                    }
                                  </>
                                ))

                              }
                            </div>
                          </MDBPopoverBody>
                        </div>
                      </MDBPopover>
                      :
                      <MDBIcon icon='thumbs-down' size="2x" className='red-text mr-1'/>
                    }
                    <span className="white-text h3-responsive">{votes.rejected}</span>
                  </div>
                </li>

              </ul>
            </div>
          </MDBCard>
          {/*<QuestionModal show={showModal} text={modalText} handleVoteYes={handleVoteYes}/>*/}
        </MDBCol>
        : null}
    </>
  )


}

const ProposalPage = () => {
  const [proposals, setProposals] = useState(null);
  const [council, setCouncil] = useState([]);

  let {dao, proposal} = useParams();
  const [showError, setShowError] = useState(null);


  useEffect(
    () => {
      window.contract = new Contract(window.walletConnection.account(), dao, {
        viewMethods: ['get_council', 'get_bond', 'get_proposal', 'get_num_proposals', 'get_proposals', 'get_vote_period', 'get_purpose'],
        changeMethods: ['vote', 'add_proposal', 'finalize'],
      })
    },
    [dao]
  )

  useEffect(
    () => {
      window.contract.get_council()
        .then(r => {
          setCouncil(r);
        }).catch((e) => {
        console.log(e);
        setShowError(e);
      })
    },
    [dao]
  )


  useEffect(
    () => {
      window.contract.get_proposals({from_index: parseInt(proposal), limit: 1})
        .then(list => {
          console.log(list)
          const t = []
          list.map((item, key) => {
            const t2 = {}
            Object.assign(t2, {key: key}, item);
            t.push(t2);
          })
          setProposals(t);
        })
    },
    [dao, proposal]
  )

  console.log(proposals)

  return (
    <MDBView className="w-100 h-100" style={{minHeight: "100vh"}}>
      <MDBMask className="d-flex justify-content-center grey lighten-2 align-items-center gradient"/>
      <Navbar/>
      <MDBContainer style={{minHeight: "100vh"}} className="mt-5">
        <MDBCol className="col-12 col-sm-8 col-lg-6 mx-auto mb-3">
          <MDBCard>
            <MDBCardBody className="text-left p-4 m-4">
              <MDBBox><b>Proposal DAO:</b> {dao}</MDBBox>
              <MDBBox><b>Council:</b> {council.map((item, key) => (<span>{item}{" "}</span>))}</MDBBox>
              <hr/>
              <MDBLink to={"/" + dao} className="btn-secondary text-center">BACK TO DAO</MDBLink>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        {proposals !== null ?
          proposals.map((item, key) => (
            <Proposal data={item} key={parseInt(proposal)} id={parseInt(proposal)} council={council}
                      setShowError={setShowError} dao={dao}/>
          ))
          : null
        }

        {proposals !== null && proposals.length === 0 ?
          <MDBCard className="text-center p-4 m-4">
            <MDBBox>Sorry, nothing was found</MDBBox>
          </MDBCard>
          : null}

      </MDBContainer>
      <Footer/>
    </MDBView>
  );

}

export default ProposalPage;


