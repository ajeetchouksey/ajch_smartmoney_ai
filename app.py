import streamlit as st
from uiux_kit import (
    inject_custom_css,
    render_header,
    render_sidebar_nav,
    render_kpi_metrics,
    render_chat_interface
)

def main():
    st.set_page_config(
        page_title="SmartMoney AI", 
        page_icon="💸", 
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Apply modern CSS styles
    inject_custom_css()
    
    # Render layout
    nav_state = render_sidebar_nav()
    render_header()
    
    # Route based on navigation
    if nav_state["current_page"] == "📊 Dashboard":
        render_kpi_metrics()
        st.info("Here we can add interactive Plotly charts, spending trends, and budget breakdowns.")
        
    elif nav_state["current_page"] == "💬 AI Assistant":
        render_chat_interface()
        
    elif nav_state["current_page"] == "📈 Portfolio":
        st.markdown("### Investment Portfolio")
        st.info("Stock market overview, ticker integration, and predictive models will go here.")
        
    elif nav_state["current_page"] == "⚙️ Settings":
        st.markdown("### Preferences")
        st.toggle("Push Notifications")
        st.toggle("Dark Mode Override")
        st.button("Disconnect Bank Accounts", type="primary")

if __name__ == "__main__":
    main()
