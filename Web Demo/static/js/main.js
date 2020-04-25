var form_id = "";
$(document).ready(function () {
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });
  console.log("Ready");
  changeForm1();
});

/* Upload Image */
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $('.image-upload-wrap').hide();

            $('.file-upload-image').attr('src', e.target.result);

            $('.file-upload-content').show();

            $('.image-title').html(input.files[0].name);

            $('#input-wrap').removeClass("col-sm-12");
            $('#input-wrap').addClass("col-sm-6");
            $('#data-table').addClass("col-sm-6");
            $('#loading').addClass("col-sm-6");
        };

        reader.readAsDataURL(input.files[0]);

    } else
    removeUpload();
}

/* Remove Button */
function removeButton() {
    removeData();
    removeUpload();
}

function removeData() {
    $('.output-data').remove();
}

function removeUpload() {
    $('.file-upload-input')[0].value = "";
    $('.file-upload-input').replaceWith($('.file-upload-input').clone());
    $('.file-upload-content').hide();
    $('.image-upload-wrap').show();
}
$('.image-upload-wrap').bind('dragover', function() {
    $('.image-upload-wrap').addClass('image-dropping');
});
$('.image-upload-wrap').bind('dragleave', function() {
    $('.image-upload-wrap').removeClass('image-dropping');
});

/* Change Form */

function changeForm1() {
    form_id = "0";
    $('#dropdownMenuLink').html("Medifast");
    console.log("Medifast");
};

function changeForm2() {
    form_id = "1";
    $('#dropdownMenuLink').html("Pathlab");
    console.log("Pathlab");
};

function changeForm3() {
    form_id = "2";
    $('#dropdownMenuLink').html("Macau");
    console.log("Macau");
};

/* Submit Form and Image*/
function submit() {
    $('#data-table').hide();
    $('#loading').show();

    /* Upload File*/
    var file = document.getElementById('myFile').files[0];
    console.log(file.size);

    if (file.size < 104857600) {
        console.log("Dang upload file");
        var fd = new FormData();

        fd.append('file', file);
        fd.append('form_id', form_id);

        $.ajax({
            url: '/submit',
            contentType: "application/json;charset=utf-8",
            processData: false,
            contentType: false,
            data: fd,
            type: 'POST',
            dataType: "json",
            beforeSend: function() {
                console.log("beforeSend");
            },
            success: function(data) {
                console.log("Sending via ajax");
                removeData();
                console.log(data);

                var personal_info = data[0],
                    feature_data = data[1];

                fillInfo(personal_info);
                fillData(feature_data);
            },
            error: function(errorThrown) {
                console.log("Error"+":"+errorThrown);
            },
            complete: function() {
                console.log("After Send");
                $('#data-table').show();
                $('#loading').hide();
            },
        });
    }
    else
        console.log("UploadSize greater than 100mB");
}
function fillInfo(data) {
    for (var key in data) {
        $("#personal_info").append(
                '<tr class="output-data" scope="row">'
            +       '<td class="font-weight-bold">' + key + '</td>'
            +       '<td>' + data[key] + '</td>'
            +       '<td></td>'
            +       '<td></td>'
            +   '</tr>'
        );
    }
}

function fillData(data) {
    for (var key in data) {
        var value = [],
            values_1st = [],
            values_2nd = [],
            value_3rd = '',
            value = data[key];

        console.log(typeof value)

        if (typeof value == 'object') {
            if (value[0].length < value[1].length) {
                console.log("Wrong value's structure")
                break

            } else if (value[1].length == 0) {
                values_1st = value[0];
                values_2nd = Array(values_1st.length).fill('');
                value_3rd = value[2];

            } else {
                values_1st = value[0];
                values_2nd = value[1];
                value_3rd = value[2];

            } for (var i = 0; i < values_1st.length; i++) {
                if(i > 0) {
                    $("#feature_data").append(
                            '<tr class="output-data" scope="row">'
                        +       '<td></td>'
                        +       '<td>' + values_1st[i] + '</td>'
                        +       '<td>' + values_2nd[i] + '</td>'
                        +       '<td></td>'
                        +   '</tr>'
                    );

                } else {
                    $("#feature_data").append(
                            '<tr class="output-data" scope="row">'
                        +       '<td class="font-weight-bold" style="width:40%">' + key + '</td>'
                        +       '<td>' + values_1st[i] + '</td>'
                        +       '<td>' + values_2nd[i] + '</td>'
                        +       '<td>' + value_3rd + '</td>'
                        +   '</tr>'
                    );
                }
            }

        } else if (typeof value == 'string') {
            $("#feature_data").append(
                    '<tr class="output-data" scope="row">'
                +       '<td class="font-weight-bold" style="width:40%">' + key + '</td>'
                +       '<td>' + value + '</td>'
                +       '<td></td>'
                +       '<td></td>'
                +       '</tr>'
            );
        }
    }
}
