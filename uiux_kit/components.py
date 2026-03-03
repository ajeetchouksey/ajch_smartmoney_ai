import streamlit as st
import pandas as pd

def inject_custom_css():
    st.markdown("""
        <style>
        /* Hide Main Menu and Footer */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        
        /* Modern padding and clean typography */
        .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
            max-width: 1200px;
        }
        
        /* Style metric cards */
        div[data-testid="metric-container"] {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s;
        }
        
        /* Hover effect for metrics */
        div[data-testid="metric-container"]:hover {
            transform: translateY(-2px);
        }
        
        /* For dark mode metric cards */
        @media (prefers-color-scheme: dark) {
            div[data-testid="metric-container"] {
                background-color: #212529;
                border: 1px solid #343a40;
            }
        }
        
        /* Chat container styling */
        .stChatMessage {
            background-color: #f8f9fa;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        @media (prefers-color-scheme: dark) {
            .stChatMessage {
                background-color: #212529;
            }
        }
        </style>
    """, unsafe_allow_html=True)

def render_header():
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("<h2 style='margin-bottom: 0px;'>💸 SmartMoney AI</h2>", unsafe_allow_html=True)
        st.caption("Your intelligent, hyper-personalized financial assistant.")
    with col2:
        st.markdown("<div style='text-align: right; margin-top: 1rem;'><span title='Online'>🟢</span> Profile</div>", unsafe_allow_html=True)
    st.markdown("---")

def render_sidebar_nav():
    with st.sidebar:
        st.markdown("### 🧭 Navigation")
        # Using radio for clean app-state navigation
        app_mode = st.radio(
            "Select Section",
            ["📊 Dashboard", "💬 AI Assistant", "📈 Portfolio", "⚙️ Settings"],
            label_visibility="collapsed"
        )
        st.markdown("---")
        st.markdown("### 🏦 Linked Accounts")
        st.success("💰 Chase Checking (...1234)")
        st.info("📉 Vanguard IRA (...5678)")
        return {"current_page": app_mode}

def render_kpi_metrics():
    st.markdown("#### Overview")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric(label="Total Net Worth", value="\,230.50", delta="+\,450.00")
    with col2:
        st.metric(label="Cash Available", value="\,400.00", delta="-\.00")
    with col3:
        st.metric(label="Investments", value="\,830.50", delta="+\,950.00")
    with col4:
        st.metric(label="Monthly Spending", value="\,150.20", delta="-12%", delta_color="inverse")
    st.markdown("<br>", unsafe_allow_html=True)

def render_chat_interface():
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {"role": "assistant", "content": "Welcome back! The market is up today. How can we optimize your finances?"}
        ]
    
    # Render previous messages
    chat_container = st.container(height=500)
    with chat_container:
        for msg in st.session_state.messages:
            with st.chat_message(msg["role"]):
                st.write(msg["content"])

    # Chat input
    if prompt := st.chat_input("Ask about your budget, markets, or investment advice..."):
        # Add user string to history and display immediately
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Simulating AI Response processing directly here so it updates dynamically
        response = f"I am your AI advisor. Let me check your data considering: '{prompt}'."
        st.session_state.messages.append({"role": "assistant", "content": response})
        st.rerun()

