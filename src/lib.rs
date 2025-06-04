use wasm_bindgen::prelude::*;
use statrs::distribution::{Normal, ContinuousCDF};
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[derive(Serialize, Deserialize)]
pub struct OptionPrices {
    call_price: f64,
    put_price: f64,
}

#[derive(Serialize, Deserialize)]
pub struct Greeks {
    delta_call: f64,
    delta_put: f64,
    gamma: f64,
    theta_call: f64,
    theta_put: f64,
    vega: f64,
    rho_call: f64,
    rho_put: f64,
}

#[derive(Serialize, Deserialize)]
pub struct ParameterSweepResult {
    x_values: Vec<f64>,
    call_prices: Vec<f64>,
    put_prices: Vec<f64>,
    delta_calls: Vec<f64>,
    delta_puts: Vec<f64>,
    gammas: Vec<f64>,
    theta_calls: Vec<f64>,
    theta_puts: Vec<f64>,
    vegas: Vec<f64>,
    rho_calls: Vec<f64>,
    rho_puts: Vec<f64>,
}

#[derive(Serialize, Deserialize)]
pub struct DistributionData {
    stock_prices: Vec<f64>,
    probabilities: Vec<f64>,
    call_payoffs: Vec<f64>,
    put_payoffs: Vec<f64>,
    expected_stock_price: f64,
    strike_price: f64,
}

#[wasm_bindgen]
pub struct BlackScholesCalculator {
    normal: Normal,
}

#[wasm_bindgen]
impl BlackScholesCalculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_log!("BlackScholesCalculator initialized");
        Self {
            normal: Normal::new(0.0, 1.0).unwrap(),
        }
    }

    pub fn calculate_option_prices(&self, 
        spot: f64, 
        strike: f64, 
        rate: f64, 
        volatility: f64, 
        time_to_maturity: f64
    ) -> JsValue {
        let d1 = (spot.ln() - strike.ln() + (rate + 0.5 * volatility.powi(2)) * time_to_maturity) 
                / (volatility * time_to_maturity.sqrt());
        let d2 = d1 - volatility * time_to_maturity.sqrt();

        let nd1 = self.normal.cdf(d1);
        let nd2 = self.normal.cdf(d2);
        let n_neg_d1 = self.normal.cdf(-d1);
        let n_neg_d2 = self.normal.cdf(-d2);

        let call_price = spot * nd1 - strike * (-rate * time_to_maturity).exp() * nd2;
        let put_price = strike * (-rate * time_to_maturity).exp() * n_neg_d2 - spot * n_neg_d1;

        let prices = OptionPrices {
            call_price,
            put_price,
        };

        serde_wasm_bindgen::to_value(&prices).unwrap()
    }

    pub fn calculate_greeks(&self,
        spot: f64,
        strike: f64,
        rate: f64,
        volatility: f64,
        time_to_maturity: f64
    ) -> JsValue {
        let sqrt_t = time_to_maturity.sqrt();
        let d1 = (spot.ln() - strike.ln() + (rate + 0.5 * volatility.powi(2)) * time_to_maturity) 
                / (volatility * sqrt_t);
        let d2 = d1 - volatility * sqrt_t;

        let nd1 = self.normal.cdf(d1);
        let nd2 = self.normal.cdf(d2);
        let n_neg_d1 = self.normal.cdf(-d1);
        let n_neg_d2 = self.normal.cdf(-d2);
        let pdf_d1 = self.normal.pdf(d1);

        // Greeks calculations
        let delta_call = nd1;
        let delta_put = -n_neg_d1;
        
        let gamma = pdf_d1 / (spot * volatility * sqrt_t);
        
        let theta_call = -(spot * pdf_d1 * volatility) / (2.0 * sqrt_t) 
                        - rate * strike * (-rate * time_to_maturity).exp() * nd2;
        let theta_put = -(spot * pdf_d1 * volatility) / (2.0 * sqrt_t) 
                       + rate * strike * (-rate * time_to_maturity).exp() * n_neg_d2;
        
        let vega = spot * pdf_d1 * sqrt_t / 100.0; // Divided by 100 for 1% change
        
        let rho_call = strike * time_to_maturity * (-rate * time_to_maturity).exp() * nd2 / 100.0;
        let rho_put = -strike * time_to_maturity * (-rate * time_to_maturity).exp() * n_neg_d2 / 100.0;

        let greeks = Greeks {
            delta_call,
            delta_put,
            gamma,
            theta_call: theta_call / 365.0, // Convert to daily theta
            theta_put: theta_put / 365.0,
            vega,
            rho_call,
            rho_put,
        };

        serde_wasm_bindgen::to_value(&greeks).unwrap()
    }

    pub fn parameter_sweep(&self,
        base_spot: f64,
        base_strike: f64,
        base_rate: f64,
        base_volatility: f64,
        base_maturity: f64,
        parameter: &str,
        range: f64,
        steps: usize
    ) -> JsValue {
        let mut x_values = Vec::new();
        let mut call_prices = Vec::new();
        let mut put_prices = Vec::new();
        let mut delta_calls = Vec::new();
        let mut delta_puts = Vec::new();
        let mut gammas = Vec::new();
        let mut theta_calls = Vec::new();
        let mut theta_puts = Vec::new();
        let mut vegas = Vec::new();
        let mut rho_calls = Vec::new();
        let mut rho_puts = Vec::new();

        // Determine parameter bounds based on selected parameter
        let (min_val, max_val) = match parameter {
            "spot" => {
                let min = (base_spot - range).max(0.001);
                let max = base_spot + range;
                (min, max)
            },
            "strike" => {
                let min = (base_strike - range).max(0.001);
                let max = base_strike + range;
                (min, max)
            },
            "volatility" => {
                let min = ((base_volatility * 100.0 - range).max(0.1)) / 100.0;
                let max = (base_volatility * 100.0 + range) / 100.0;
                (min, max)
            },
            "rate" => {
                let min = ((base_rate * 100.0 - range).max(0.0)) / 100.0;
                let max = (base_rate * 100.0 + range) / 100.0;
                (min, max)
            },
            "maturity" => {
                let min = (base_maturity - range).max(0.001);
                let max = base_maturity + range;
                (min, max)
            },
            _ => panic!("Invalid parameter")
        };

        let step_size = (max_val - min_val) / (steps as f64 - 1.0);

        for i in 0..steps {
            let x = min_val + (i as f64) * step_size;
            x_values.push(x);

            // Set parameters based on which one is being varied
            let (spot, strike, rate, vol, mat) = match parameter {
                "spot" => (x, base_strike, base_rate, base_volatility, base_maturity),
                "strike" => (base_spot, x, base_rate, base_volatility, base_maturity),
                "volatility" => (base_spot, base_strike, base_rate, x, base_maturity),
                "rate" => (base_spot, base_strike, x, base_volatility, base_maturity),
                "maturity" => (base_spot, base_strike, base_rate, base_volatility, x),
                _ => panic!("Invalid parameter")
            };

            // Calculate prices and Greeks
            let prices_js = self.calculate_option_prices(spot, strike, rate, vol, mat);
            let prices: OptionPrices = serde_wasm_bindgen::from_value(prices_js).unwrap();
            
            let greeks_js = self.calculate_greeks(spot, strike, rate, vol, mat);
            let greeks: Greeks = serde_wasm_bindgen::from_value(greeks_js).unwrap();

            call_prices.push(prices.call_price);
            put_prices.push(prices.put_price);
            delta_calls.push(greeks.delta_call);
            delta_puts.push(greeks.delta_put);
            gammas.push(greeks.gamma);
            theta_calls.push(greeks.theta_call);
            theta_puts.push(greeks.theta_put);
            vegas.push(greeks.vega);
            rho_calls.push(greeks.rho_call);
            rho_puts.push(greeks.rho_put);
        }

        // Convert x_values for display based on parameter type
        let display_x_values = match parameter {
            "volatility" => x_values.iter().map(|&x| x * 100.0).collect(),
            "rate" => x_values.iter().map(|&x| x * 100.0).collect(),
            _ => x_values.clone()
        };

        let result = ParameterSweepResult {
            x_values: display_x_values,
            call_prices,
            put_prices,
            delta_calls,
            delta_puts,
            gammas,
            theta_calls,
            theta_puts,
            vegas,
            rho_calls,
            rho_puts,
        };

        serde_wasm_bindgen::to_value(&result).unwrap()
    }

    pub fn calculate_distribution(&self,
        spot: f64,
        strike: f64,
        rate: f64,
        volatility: f64,
        time_to_maturity: f64,
        num_points: usize
    ) -> JsValue {
        // Calculate parameters for the lognormal distribution
        let drift = (rate - 0.5 * volatility.powi(2)) * time_to_maturity;
        let diffusion = volatility * time_to_maturity.sqrt();
        
        // Expected stock price at maturity under risk-neutral measure
        let expected_stock_price = spot * (rate * time_to_maturity).exp();
        
        // Generate stock price range (from 0.1*spot to 3*spot for good coverage)
        let min_price = spot * 0.1;
        let max_price = spot * 3.0;
        let price_step = (max_price - min_price) / (num_points as f64 - 1.0);
        
        let mut stock_prices = Vec::with_capacity(num_points);
        let mut probabilities = Vec::with_capacity(num_points);
        let mut call_payoffs = Vec::with_capacity(num_points);
        let mut put_payoffs = Vec::with_capacity(num_points);
        
        for i in 0..num_points {
            let s_t = min_price + (i as f64) * price_step;
            stock_prices.push(s_t);
            
            // Calculate lognormal probability density
            if s_t > 0.0 {
                let ln_s_t = s_t.ln();
                let ln_s_0 = spot.ln();
                let numerator = (ln_s_t - ln_s_0 - drift).powi(2);
                let denominator = 2.0 * diffusion.powi(2);
                let pdf = (1.0 / (s_t * diffusion * (2.0 * std::f64::consts::PI).sqrt())) 
                    * (-numerator / denominator).exp();
                probabilities.push(pdf);
            } else {
                probabilities.push(0.0);
            }
            
            // Calculate payoffs
            call_payoffs.push((s_t - strike).max(0.0));
            put_payoffs.push((strike - s_t).max(0.0));
        }
        
        let distribution_data = DistributionData {
            stock_prices,
            probabilities,
            call_payoffs,
            put_payoffs,
            expected_stock_price,
            strike_price: strike,
        };
        
        serde_wasm_bindgen::to_value(&distribution_data).unwrap()
    }
}

// Helper for normal distribution PDF
trait NormalPDF {
    fn pdf(&self, x: f64) -> f64;
}

impl NormalPDF for Normal {
    fn pdf(&self, x: f64) -> f64{
        (1.0 / (2.0 * std::f64::consts::PI).sqrt()) * (-0.5 * x.powi(2)).exp()
    }
}