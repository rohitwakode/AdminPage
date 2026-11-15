const appendFields = (formData, values, prefix = '') => {
    Object.entries(values).forEach(([key, value]) => {
        const fieldName = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
            return;
        }

        if (typeof value === 'object') {
            appendFields(formData, value, fieldName);
            return;
        }

        formData.append(fieldName, String(value));
    });
};

const createDoctorFormData = (doctorData, imageFile) => {
    const formData = new FormData();
    appendFields(formData, doctorData);

    if (imageFile) {
        formData.append('image', imageFile);
    }

    return formData;
};

export default createDoctorFormData;
