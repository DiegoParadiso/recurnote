import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@context/ThemeContext';
import Loader from '@components/common/Loader';
import './PricingPage.css';

const PricingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLightTheme } = useTheme();
    const [isArgentina, setIsArgentina] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Detect user location and get exchange rate
        const detectLocationAndRate = async () => {
            try {
                let isFromArgentina = false;

                // Primary: ipapi.co (Can hit 429 rate limit)
                try {
                    const locationResponse = await fetch('https://ipapi.co/json/');
                    if (locationResponse.ok) {
                        const locationData = await locationResponse.json();
                        isFromArgentina = locationData.country_code === 'AR';
                    } else {
                        throw new Error('ipapi limit reached');
                    }
                } catch (e) {
                    // Fallback: country.is (Simple, no keys)
                    try {
                        const fallbackResponse = await fetch('https://api.country.is/');
                        if (fallbackResponse.ok) {
                            const fallbackData = await fallbackResponse.json();
                            isFromArgentina = fallbackData.country === 'AR';
                        }
                    } catch (err) {
                        // Ultimate fallback: Browser timezone guess
                        isFromArgentina = Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Buenos_Aires');
                    }
                }

                setIsArgentina(isFromArgentina);

                // Get exchange rate if from Argentina
                if (isFromArgentina) {
                    try {
                        const rateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                        if (rateResponse.ok) {
                            const rateData = await rateResponse.json();
                            setExchangeRate(rateData.rates.ARS);
                        }
                    } catch (e) {
                        console.error('Failed to grab exchange rates', e);
                    }
                }
            } catch (error) {
                console.error('Critical error in pricing loading sequence:', error);
            } finally {
                setLoading(false); // ALWAYS release the loader
            }
        };

        detectLocationAndRate();
    }, []);

    const plans = {
        monthly: {
            id: 'monthly',
            usdPrice: 3.99,
            arsPrice: 2.99,
            interval: 'month'
        },
        annual: {
            id: 'annual',
            usdPrice: 29.99,
            arsPrice: 24.99, // Discount for Argentina
            interval: 'year'
        }
    };

    const handleSelectPlan = (planType) => {
        const selectedPlan = plans[planType];
        const price = isArgentina ? selectedPlan.arsPrice : selectedPlan.usdPrice;
        const currency = 'USD'; // PayPal requires USD for this account, ARS is not supported for holding

        navigate('/payment', {
            state: {
                planType,
                price,
                currency,
                interval: selectedPlan.interval
            }
        });
    };

    const formatPrice = (usdPrice, arsPrice) => {
        if (isArgentina && exchangeRate) {
            const arsConverted = (usdPrice * exchangeRate).toFixed(2);
            return {
                primary: `${arsPrice} ARS`,
                secondary: `(~${arsConverted} ARS ${t('pricing.converted')})`
            };
        }
        return {
            primary: `$${usdPrice}`,
            secondary: 'USD'
        };
    };

    const calculateSavings = () => {
        const monthlyYearly = plans.monthly.usdPrice * 12;
        const savings = ((monthlyYearly - plans.annual.usdPrice) / monthlyYearly * 100).toFixed(0);
        return savings;
    };

    // Replace early skeleton with an overlay inside the main return
    // (We simply let it flow into the main return below)

    return (
        <div className="pricing-page" style={{ position: 'relative', overflow: 'hidden' }}>
            {loading && <Loader size={120} fullScreen={true} />}
            <img src={isLightTheme ? "/assets/carrito.png" : "/assets/carrito2.png"} className="bg-illustration" alt="" aria-hidden="true" />
            <div className="pricing-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={24} />
                </button>
                <h1>{t('pricing.title')}</h1>
            </div>

            {isArgentina && (
                <div className="pricing-region-badge">
                    <Sparkles size={16} />
                    <span>{t('pricing.specialPricingArgentina')}</span>
                </div>
            )}

            <div className="pricing-content">
                <p className="pricing-subtitle">{t('pricing.subtitle')}</p>

                <div className="pricing-cards">
                    {/* Monthly Plan */}
                    <div className="pricing-card">
                        <div className="pricing-card-header">
                            <h2>{t('pricing.monthly')}</h2>
                            <div className="pricing-card-price">
                                <span className="price-amount">
                                    {isArgentina ? plans.monthly.arsPrice : `$${plans.monthly.usdPrice}`}
                                </span>
                                <span className="price-currency">
                                    {isArgentina ? 'ARS' : 'USD'}
                                </span>
                                <span className="price-interval">/ {t('pricing.month')}</span>
                            </div>
                            {!isArgentina && (
                                <p className="pricing-card-description">{t('pricing.monthlyDesc')}</p>
                            )}
                            {isArgentina && exchangeRate && (
                                <p className="pricing-conversion">
                                    ${plans.monthly.usdPrice} USD ≈ {(plans.monthly.usdPrice * exchangeRate).toFixed(2)} ARS
                                </p>
                            )}
                        </div>

                        <ul className="pricing-features">
                            <li>
                                <Check size={20} />
                                <span>{t('premium.unlimitedNotes')}</span>
                            </li>
                            <li>
                                <Check size={20} />
                                <span>{t('premium.exclusiveStyles')}</span>
                            </li>
                            <li>
                                <Check size={20} />
                                <span>{t('premium.whiteboardMode')}</span>
                            </li>
                            <li>
                                <Check size={20} />
                                <span>{t('premium.fullHistory')}</span>
                            </li>
                        </ul>

                        <button
                            className="pricing-select-button"
                            onClick={() => handleSelectPlan('monthly')}
                        >
                            {t('pricing.selectPlan')}
                        </button>
                    </div>

                    {/* Annual Plan */}
                    <div className="pricing-card pricing-card-popular">
                        <div className="popular-badge">
                            <Sparkles size={14} />
                            {t('pricing.mostPopular')}
                        </div>

                        <div className="pricing-card-header">
                            <h2>{t('pricing.annual')}</h2>
                            <div className="pricing-card-price">
                                <span className="price-amount">
                                    {isArgentina ? plans.annual.arsPrice : `$${plans.annual.usdPrice}`}
                                </span>
                                <span className="price-currency">
                                    {isArgentina ? 'ARS' : 'USD'}
                                </span>
                                <span className="price-interval">/ {t('pricing.year')}</span>
                            </div>
                            <div className="savings-badge">
                                {t('pricing.save')} {calculateSavings()}%
                            </div>
                            {isArgentina && exchangeRate && (
                                <p className="pricing-conversion">
                                    ${plans.annual.usdPrice} USD ≈ {(plans.annual.usdPrice * exchangeRate).toFixed(2)} ARS
                                </p>
                            )}
                        </div>

                        <ul className="pricing-features">
                            <li>
                                <Check size={20} />
                                <span>{t('premium.unlimitedNotes')}</span>
                            </li>
                            <li>
                                <Check size={20} />
                                <span>{t('premium.exclusiveStyles')}</span>
                            </li>
                            <li>
                                <Check size={20} />
                                <span>{t('premium.whiteboardMode')}</span>
                            </li>
                            <li>
                                <Check size={20} />
                                <span>{t('premium.fullHistory')}</span>
                            </li>
                        </ul>

                        <button
                            className="pricing-select-button pricing-select-button-popular"
                            onClick={() => handleSelectPlan('annual')}
                        >
                            {t('pricing.selectPlan')}
                        </button>
                    </div>
                </div>

                <p className="pricing-footer-note">{t('premium.freeTrial')}</p>
            </div>
        </div>
    );
};

export default PricingPage;
