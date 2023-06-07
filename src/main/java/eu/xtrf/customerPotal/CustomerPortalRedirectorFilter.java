/**
 * 
 */
package eu.xtrf.customerPotal;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

/**
 * This filter class is responsible for serving proper customer portal static assets. If no customized customer portal is installed it
 * serves static content directly from the war file. If customized customer portal is installed it forwards all requests to the customized
 * portal.
 * 
 * The customized customer portal is considered present if it is deployed on the same server under context defined in
 * {@link CustomCustomerPortalStatusMonitor.CUSTOM_CUSTOMER_PORTAL_CONTEXT_NAME} = {@value #CUSTOM_CUSTOMER_PORTAL_CONTEXT_NAME}
 * 
 * @author radzisz
 *
 */
public class CustomerPortalRedirectorFilter implements Filter {

	private static final Logger logger = Logger.getLogger(CustomerPortalRedirectorFilter.class);

	private final static String CUSTOM_CUSTOMER_PORTAL_CONTEXT_NAME = "/custom-customers";
	private static CustomCustomerPortalStatusMonitor customCustomerPortalStatusMonitor;

	public void init(FilterConfig filterConfig) throws ServletException {
		customCustomerPortalStatusMonitor = CustomCustomerPortalStatusMonitor
				.getInstanceForContext(CUSTOM_CUSTOMER_PORTAL_CONTEXT_NAME, filterConfig.getServletContext());
	}

	public void doFilter(ServletRequest req, ServletResponse resp,
			FilterChain chain) throws IOException, ServletException {

		// forward the request
		if (customCustomerPortalStatusMonitor.isCustomCustomerPortalDeployed()) {
			forwardRequestToCustomCustomerPortal(req, resp);
		} else {
			// serve from a local war
			chain.doFilter(req, resp);// sends request to next resource
		}

	}

	public void destroy() {
	}

	private void forwardRequestToCustomCustomerPortal(ServletRequest req, ServletResponse resp) throws IOException, ServletException {

		HttpServletRequest httpReq = (HttpServletRequest) req;
		ServletContext customCustomerPortalServletContext = req.getServletContext().getContext(CUSTOM_CUSTOMER_PORTAL_CONTEXT_NAME);
		if (customCustomerPortalServletContext == null) {
			throw new InternalError("Cound not find servlet for context:" + CUSTOM_CUSTOMER_PORTAL_CONTEXT_NAME
					+ ", while custom customer portal claimed to be present under this context!");
		}
		RequestDispatcher dispatcher = customCustomerPortalServletContext.getRequestDispatcher(httpReq.getServletPath());
		dispatcher.forward(req, resp);
	}

	/**
	 * Monitors if a custom customer portal is deployed. There is no way to subscribe for an event about the war deployment so the check
	 * (refresh) needs to be done with each request. Luckily it seems to be a very light operation.
	 * 
	 * @author radzisz
	 *
	 */
	private static class CustomCustomerPortalStatusMonitor {

		private enum Status {
			UNKNOWN(),
			NO_CUSTOMIZED_CUSTOMER_PORTAL_DETECTED,
			CUSTOMIZED_CUSTOMER_PORTAL_PRESENT
		}

		private Status status = Status.UNKNOWN;
		private String contextName;
		private ServletContext ctx;
		
		
		private CustomCustomerPortalStatusMonitor(String contextName, ServletContext ctx) {
			this.contextName = contextName;
			this.ctx = ctx;
		}

		public static CustomCustomerPortalStatusMonitor getInstanceForContext(String contextName, ServletContext ctx) {
			return new CustomCustomerPortalStatusMonitor(contextName, ctx);
		}

		public boolean isCustomCustomerPortalDeployed() {
			refresh();
			return status == Status.CUSTOMIZED_CUSTOMER_PORTAL_PRESENT;
		}

		private void refresh() {
			ServletContext servletContextForCustomContextName = ctx.getContext(contextName);
				//servletContextForCustomContextName is null if 404 is returned for the page
				//if an app for a global context is deployed  e.g. with global.war not null context is returned
			    //the global context app is not the custom app we are looking for
			if (servletContextForCustomContextName != null && 
				    servletContextForCustomContextName.getContextPath().trim() != "") {
					setStatus(Status.CUSTOMIZED_CUSTOMER_PORTAL_PRESENT);
				}
			else {
			  setStatus(Status.NO_CUSTOMIZED_CUSTOMER_PORTAL_DETECTED);			
			}
		}

		private void setStatus(Status status) {
			if (this.status != status) {
				this.status = status;
				String message = "No Custom Customer Portal detected  - build-in customer portal will be used.\n"
						+ "If you wish to use a custom customer portal make sure you deploy it under: "
						+ contextName;
				if (isCustomCustomerPortalDeployed()) {
					message = "Custom Customer portal detected - content will be served from: " + contextName;
				}
				logger.info(message);
			}
		}
	}
}
