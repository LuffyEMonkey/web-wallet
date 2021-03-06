import React, { Component } from 'react';
import ModalContainer from './ModalContainer';
import BlueButton from 'components/BlueButton';
import './TransactionConfirm.scss';
import { connect } from "react-redux";
import * as actions from "actions/index";
import T from 'i18n-react';
import makeTransaction from 'libs/newTransaction';
import async from 'async';
import AmountSpan from "components/AmountSpan";
import ErrorPopup from "./ErrorPopup";
import learnMoreIcon from 'assets/imgs/show-error-detail.png';
import closeIcon from 'assets/imgs/hide-error-detail.png';
import pageview from "utils/pageview";
import BigNumber from "bignumber.js";

class TransactionConfirm extends Component {
	constructor() {
		super();

		this.state = {
			error: null,
		};

		this.showSendComplete = this.showSendComplete.bind(this);
	}
	showSendComplete = () => {
		this.props.showSpinner( true );

		const queue = [];

    const paymentData = this.props.paymentData;

		const sendPayment = callback => {
			fetch(`${process.env.API_URL}/api/v1/accounts/${this.props.keypair.publicKey()}`, {
				method: 'GET',
				timeout: 3000,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			})
			.then(res => {
				return res.json()
			})
			.then(account => {
				account.balance = new BigNumber(account.balance).div(10000000).toFixed(7).replace(/[0]+$/, '').replace(/[.]+$/, '');
				this.props.streamAccount(account);
			})
			.then(() => {
				makeTransaction(this.props.keypair, paymentData.destination, paymentData.amount, 'payment', 	this.props.account.sequence_id)
					.then((response) => {
						return response.json();
					})
					.then((result) => {
						if (result.status === 'submitted') {
							callback(null, false);
						}
						else {
							const $error = result;
							callback($error);
						}
					})
				
			})
		};

		const createAccount = callback => {
			fetch(`${process.env.API_URL}/api/v1/accounts/${this.props.keypair.publicKey()}`, {
				method: 'GET',
				timeout: 3000,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			})
			.then(res => {
				return res.json()
			})
			.then(account => {
				account.balance = new BigNumber(account.balance).div(10000000).toFixed(7).replace(/[0]+$/, '').replace(/[.]+$/, '');
				this.props.streamAccount(account);
			})
			.then(() => {
				makeTransaction(this.props.keypair, paymentData.destination, paymentData.amount, 'create', 	this.props.account.sequence_id )
				.then((response) => {
					return response.json();
				})
				.then((result) => {
					if(result.status === 'submitted') {
						callback( null, false );
					}
					else {
						const $error = result;
						callback( $error );
					}
				})
			})
		};

		const onQueueComplete = ( $error, $result ) => {
			if ( $error ) {
				this.props.showSpinner( false );
				this.props.transactionComplete( false, null );
				// this.props.transactionConfirm( false, null );
				this.setState( { error: $error } );
			}
			else {
				this.props.showSpinner( false );
				this.props.transactionComplete( true, this.props.paymentData );
				this.props.transactionConfirm( false, null );
			}
		};

		const checkAddressExist = () => {
        fetch(`${process.env.API_URL}/api/v1/accounts/${this.props.paymentData.destination}`, {
          method: 'GET',
          timeout: 3000,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        .then(res => {
          return res.json()
        })
        .then(data => {
          if (data.status === 404) {
          	queue.push( createAccount );
            async.waterfall( queue, onQueueComplete );
          }

          if(!data.status) {
            queue.push( sendPayment );
            async.waterfall( queue, onQueueComplete );
          }

        })
		};

		checkAddressExist();
	};

	hideTransactionConfirm = () => {
		this.props.transactionConfirm( false, null );
	};

	doSend = () => {
		if (!this.props.resKey) {
			this.showSendComplete();
		} else {
			this.props.showAuthUser(true, this.showSendComplete);
		}
	}

	render() {
		let amount = 0;
		let total = 0;
		
		if ( this.props.paymentData ) {
			amount = this.props.paymentData.amount;
			total = this.props.paymentData.transactionTotal;
		}
		return (
			<ModalContainer modalOpen={this.props.modalOpen} doClose={this.hideTransactionConfirm}>
				{ this.state.error &&
				<ErrorPopup>
					<h2 className="text-center">Error</h2>
					<div>
						{ T.translate( 'error_popup.main_message' ) }
					</div>
					<div className="text-right">
						<button className="error-popup__learn-more"
							onClick={ () => this.setState( { showErrorDetail: !this.state.showErrorDetail } ) }
						>
							{ this.state.showErrorDetail &&
								<span>
									{ T.translate( 'error_popup.close' ) }
								<img src={ closeIcon } alt={ T.translate( 'error_popup.close' ) }/>
								</span>
							}
							{ !this.state.showErrorDetail &&
								<span>
									{ T.translate( 'error_popup.learn_more' ) }
								<img src={ learnMoreIcon } alt={ T.translate( 'error_popup.learn_more' ) }/>
								</span>
							}
						</button>
					</div>
					{ this.state.showErrorDetail &&
					<div>
						<p>Error Code</p>
						<pre>{ this.state.error.title }</pre>
						<p>Code</p>
						<pre>{ JSON.stringify( this.state.error) }</pre>
					</div>
					}
					<div className={ 'text-center'}>
						<BlueButton medium
							onClick={ () => this.props.transactionConfirm( false, null ) }
						>{ T.translate( 'common.close' ) }</BlueButton>
					</div>
				</ErrorPopup>
				}
				<div className="transaction-confirm-container">
					<h1>
						{T.translate( "transaction_confirm.header" )}
					</h1>
					<span className="under-line"></span>
					<p>
						{T.translate( "transaction_confirm.text" )}
					</p>
					<div className="transaction-box">
						<table>
							<tbody>
							<tr>
								<td>
									{T.translate( "common.public_address" )}
								</td>
								<td style={{ wordBreak: 'break-all' }}>
									{this.props.paymentData ? this.props.paymentData.destination : ''}
								</td>
							</tr>
							<tr>
								<td>{T.translate( "common.amount" )}</td>
								<td>
									<AmountSpan value={ new BigNumber(amount).toFormat(7).replace(/[0]+$/, '').replace(/[.]+$/, '') }/> BOS
								</td>
							</tr>
							<tr>
								<td>{T.translate( "common.transaction_fee" )}</td>
								<td>
									<AmountSpan value={ process.env.TRANSACTION_FEE }/> BOS
								</td>
							</tr>
							<tr>
								<td>
									{T.translate( "common.total_amount" )}
								</td>
								<td>
									<AmountSpan value={ new BigNumber(total).toFormat(7).replace(/[0]+$/, '').replace(/[.]+$/, '') }/> BOS
								</td>
							</tr>
							</tbody>
						</table>
					</div>
					<p className="button-wrapper">
						<BlueButton medium onClick={this.doSend}>{T.translate( "common.send" )}</BlueButton>
						<BlueButton medium
									onClick={this.hideTransactionConfirm}>{T.translate( "common.cancel" )}</BlueButton>
					</p>
				</div>
			</ModalContainer>
		)
	}

	componentDidMount() {
		pageview( '/popup/transaction-confirm' );
	}
}

const mapStoreToProps = ( store ) => ({
	keypair: store.keypair.keypair,
	resKey: store.keypair.resKey,
  paymentData: store.transactionConfirm.paymentData,
  account: store.stream.account,
});

const mapDispatchToProps = ( dispatch ) => ({
	streamAccount: ( $account ) => {
		dispatch( actions.streamAccount( $account ) );
	},
	showSpinner: ( $isShow ) => {
		dispatch( actions.showSpinner( $isShow ) );
	},
	showAuthUser: ( $isShow, $callback ) => {
		dispatch( actions.showAuthUser( $isShow, $callback ) );
	},
	transactionConfirm: ( $isShow, $paymentData ) => {
		dispatch( actions.showTransactionConfirm( $isShow, $paymentData ) );
	},
	transactionComplete: ( $isShow, $paymentData ) => {
		dispatch( actions.showTransactionComplete( $isShow, $paymentData ) );
	}
});

TransactionConfirm = connect( mapStoreToProps, mapDispatchToProps )( TransactionConfirm );

export default TransactionConfirm;